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
      .json(new apiError(false, 500, null, "OTP verification failed", true));
  }
};

const login = async (req, res) => {
  try {
    const { emailOrphone, password } = req.body;

    // Validate input
    if (!emailOrphone || !password) {
      return res
        .status(400)
        .json(
          new apiError(
            false,
            400,
            null,
            "Email/phone and password required",
            true
          )
        );
    }

    // Find user
    const user = await userModel.findOne({
      $or: [{ email: emailOrphone }, { mobile: emailOrphone }],
    });
    if (!user) {
      return res
        .status(404)
        .json(new apiError(false, 404, null, "User not found", true));
    }

    // Check verification
    if (!user.isVerified) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, "Account not verified", true));
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, "Invalid credentials", true));
    }

    // Generate tokens
    const accessToken = await makeJWTToken({ id: user._id });
    const refreshToken = await makeRefreshToken({ id: user._id });

    // Store refresh token (array for multiple devices)
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set secure HTTP-only cookies
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json(new apiResponse(true, { accessToken }, "Login successful", false));
  } catch (error) {
    return res
      .status(500)
      .json(new apiError(false, 500, null, "Login failed", true));
  }
};

const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, "Refresh token required", true));
    }

    // Verify token
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await userModel.findById(decoded.id);

    // Validate stored token
    if (!user?.refreshTokens.includes(oldRefreshToken)) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, "Invalid refresh token", true));
    }

    // Generate new tokens
    const newAccessToken = await makeJWTToken({ id: user._id });
    const newRefreshToken = await makeRefreshToken({ id: user._id });

    // Rotate tokens (remove old, add new)
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== oldRefreshToken
    );
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Update cookies
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
          { accessToken: newAccessToken },
          "Token refreshed",
          false
        )
      );
  } catch (error) {
    return res
      .status(403)
      .json(new apiError(false, 403, null, "Token refresh failed", true));
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await userModel.findById(decoded.id);

      // Remove the specific refresh token
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json(new apiResponse(true, null, "Logout successful", false));
  } catch (error) {
    return res
      .status(500)
      .json(new apiError(false, 500, null, "Logout failed", true));
  }
};

module.exports = { userSignup, VerifyOtp, login, logout, refreshToken };
