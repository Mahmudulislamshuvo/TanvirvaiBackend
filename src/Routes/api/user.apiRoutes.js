const express = require("express");
const {
  userSignup,
  VerifyOtp,
  login,
  refreshToken,
  resetPassword,
} = require("../../Controllers/auth.controller");
const _ = express.Router();

_.route("/auth/signup").post(userSignup);
_.route("/auth/verify-otp").post(VerifyOtp);
_.route("/auth/login").post(login);
// _.route("/auth/logout").post(logout);
_.route("/auth/refresh-token").post(refreshToken);
_.route("/auth/resetpassword").post(resetPassword);

module.exports = _;
