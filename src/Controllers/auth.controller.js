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
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      if (existingUser.isVerified === false) {
        // Generate a new OTP
        const newOtp = await Otpnumbergenertor();
        // Update the existing user with the new OTP and a new expiry time (10 minutes from now)
        existingUser.Otp = newOtp;
        existingUser.otpExpire = Date.now() + 10 * 60 * 1000;
        await existingUser.save();

        // Send the OTP email
        const emailSent = await sendMail(email, newOtp);
        if (!emailSent) {
          return res
            .status(401)
            .json(
              new apiError(
                false,
                401,
                null,
                "Unable to send OTP email. Please try again.",
                true
              )
            );
        }

        return res
          .status(409)
          .json(
            new apiError(
              false,
              409,
              null,
              "This email is already registered. We have resent the OTP to your email. Please verify your account.",
              true
            )
          );
      } else {
        // User exists and is verified. Inform them to log in.
        return res
          .status(409)
          .json(
            new apiError(
              false,
              409,
              null,
              "This email is already registered. Please log in.",
              true
            )
          );
      }
    }
    // Hash password
    const hashedPassword = await makeHashPassword(password);

    // Generate OTP
    const otp = await Otpnumbergenertor();
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
      .json(new apiError(false, 500, null, `Signup failed ${error}`, true));
  }
};

const VerifyOtp = async (req, res) => {
  try {
    const { email, Otp } = req.body;

    if (!email || !Otp) {
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
    if (user.Otp !== parseInt(Otp) || Date.now() > user.otpExpire) {
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
    const { emailOrphone, password } = req.body;
    if (!emailOrphone || !password) {
      return res
        .status(400)
        .json(
          new apiError(false, 400, null, "User credential Missing!!", true)
        );
    }
    // check the user is valid or not
    const loggedUser = await userModel.findOne({
      $or: [{ email: emailOrphone }, { mobile: emailOrphone }],
    });

    // Password Checking
    const IspasswordCorrect = await comparePassword(
      password,
      loggedUser?.password
    );

    if (!IspasswordCorrect) {
      return res
        .status(400)
        .json(
          new apiError(false, 400, null, "User credential Missing!!!!", true)
        );
    }
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

const resetPassword = async (req, res) => {
  try {
    const { emailOrphone, oldPassword, newPassword } = req.body;
    for (let key in req.body) {
      if (!req.body[key]) {
        return res
          .status(403)
          .json(
            new apiError(
              false,
              403,
              null,
              `Reset password Credential missing!!`,
              true
            )
          );
      }
    }

    if (!PasswordChecker(newPassword)) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, `password format invalid`, true));
    }
    const CheckUser = await userModel.findOne({
      $or: [
        { email: req.body.emailOrphone },
        { mobile: req.body.emailOrphone },
      ],
    });

    // check the old password with database
    const IspasswordValid = await comparePassword(
      req.body.oldPassword,
      CheckUser?.password
    );

    if (!CheckUser || !IspasswordValid) {
      return res
        .status(403)
        .json(new apiError(false, 403, null, `User not valid!!`, true));
    }

    // now hash new password and save it to database
    const newHashpassword = await makeHashPassword(req.body.newPassword);
    if (!newHashpassword) {
      return res
        .status(403)
        .json(
          new apiError(false, 403, null, `unable to hash the password`, true)
        );
    }
    if (newHashpassword) {
      CheckUser.password = newHashpassword;
      await CheckUser.save();
      return res.status(201).json(
        new apiResponse(
          true,
          {
            data: {
              name: CheckUser.firstName,
              email: CheckUser.email,
            },
          },
          "Password changed Successfull",
          false
        )
      );
    }
    return res
      .status(403)
      .json(
        new apiError(
          false,
          403,
          null,
          `unable to change the password try again`,
          true
        )
      );
  } catch (error) {
    return res
      .status(501)
      .json(
        new apiError(
          false,
          501,
          null,
          `Error from resetPassword Controller ${error}`,
          true
        )
      );
  }
};

module.exports = { userSignup, VerifyOtp, login, refreshToken, resetPassword };
