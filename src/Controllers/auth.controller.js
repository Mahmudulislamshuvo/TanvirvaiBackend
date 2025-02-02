const { apiError } = require("../utils/apiError");
const { apiResponse } = require("../utils/apiResponse");
const userModel = require("../Model/user.model");
const { Mailchecker, PasswordChecker } = require("../helpers/validator");
const { makeHashPassword, comparePassword } = require("../helpers/bycript");
const { Otpnumbergenertor } = require("../helpers/otpNembersgen");
const { sendMail } = require("../helpers/nodemailer");
const { makeJWTToken, makeRefreshToken } = require("../helpers/jwtToken");
const jwt = require("jsonwebtoken");

const userSignup = async (req, res) => {
  try {
    const { firstName, email, mobile, password } = req.body;

    // Validate input fields
    if (!firstName || !email || !mobile || !password) {
      return res
        .status(400)
        .json(new apiError(false, 400, null, "All fields are required", true));
    }

    // Validate email/password format
    if (!Mailchecker(email) || !PasswordChecker(password)) {
      return res
        .status(400)
        .json(
          new apiError(false, 400, null, "Invalid email/password format", true)
        );
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json(new apiError(false, 409, null, "User already exists", true));
    }

    // Hash password
    const hashedPassword = await makeHashPassword(password);

    // Generate OTP
    const otp = Otpnumbergenertor();
    const otpExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save user to DB (unverified)
    const newUser = await new userModel({
      firstName,
      email,
      mobile,
      password: hashedPassword,
      Otp: otp,
      otpExpire: otpExpireTime,
    }).save();

    // Send OTP via email
    const isEmailSent = await sendMail(email, otp);
    if (!isEmailSent) {
      await userModel.findByIdAndDelete(newUser._id); // Rollback if email fails
      return res
        .status(500)
        .json(new apiError(false, 500, null, "Failed to send OTP", true));
    }

    return res
      .status(201)
      .json(new apiResponse(true, { email }, "OTP sent successfully", false));
  } catch (error) {
    return res
      .status(500)
      .json(new apiError(false, 500, null, "Signup failed", true));
  }
};

const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json(new apiError(false, 400, null, "Email and OTP required", true));
    }

    // Find unverified user
    const user = await userModel.findOne({ email, isVerified: false });
    if (!user) {
      return res
        .status(404)
        .json(new apiError(false, 404, null, "User not found", true));
    }

    // Check OTP validity
    if (user.Otp !== parseInt(otp) || Date.now() > user.otpExpire) {
      user.Otp = null;
      user.otpExpire = null;
      await user.save();
      return res
        .status(400)
        .json(new apiError(false, 400, null, "Invalid/expired OTP", true));
    }

    // Mark user as verified
    user.isVerified = true;
    user.Otp = null;
    user.otpExpire = null;
    await user.save();

    return res
      .status(200)
      .json(
        new apiResponse(true, { email }, "Account verified successfully", false)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(false, 500, null, `OTP verification failed ${error}`, true)
      );
  }
};

const login = async (req, res) => {
  try {
    // ... existing login logic ...

    // Generate tokens
    const accessToken = await makeJWTToken({ id: user._id });
    const refreshToken = await makeRefreshToken({ id: user._id });

    // Set cookies for web and return tokens in body for mobile
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new apiResponse(
          true,
          { accessToken, refreshToken },
          "Login successful",
          false
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(
          false,
          500,
          null,
          `Error from Login Controller ${error}`,
          true
        )
      );
  }
};

const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, "Refresh token required", true));
    }

    // Verify without database check
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decoded) {
      return res
        .status(404)
        .json(new apiError(false, 404, null, "User not found", true));
    }
    // decode the Refresh old token
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json(new apiError(false, 404, null, "User not found", true));
    }

    // Generate new tokens
    const newAccessToken = await makeJWTToken({ id: user._id });
    const newRefreshToken = await makeRefreshToken({ id: user._id });

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(
        new apiResponse(
          true,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Token refreshed",
          false
        )
      );
  } catch (error) {
    return res
      .status(403)
      .json(
        new apiError(false, 403, null, `Token refresh failed ${error}`, true)
      );
  }
};

// const logout = async (req, res) => {
//   try {
//     // Clear cookies for web
//     res.clearCookie("accessToken");
//     res.clearCookie("refreshToken");

//     // Mobile clients should delete tokens from storage
//     return res
//       .status(200)
//       .json(new apiResponse(true, null, "Logout successful", false));
//   } catch (error) {
//     return res
//       .status(500)
//       .json(new apiError(false, 500, null, "Logout failed", true));
//   }
// };

module.exports = { userSignup, VerifyOtp, login, refreshToken };
