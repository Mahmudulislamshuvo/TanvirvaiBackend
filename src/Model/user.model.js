const mongoose = require("mongoose");
const { Schema } = mongoose;

const userModel = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name missing !!"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email missing !!"],
      trim: true,
    },
    recoveryEmail: {
      type: String,
      default: null,
    },
    mobile: {
      type: String,
      required: [true, "Mobile Number missing !!"],
      trim: true,
      maxlength: [11, "Max length is 11"],
      minlength: [11, "Min length is 11"],
    },
    address1: {
      type: String,
      trim: true,
    },
    address2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    postCode: {
      type: Number,
      trim: true,
    },
    division: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password missing !!"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "merchant"],
      default: "user",
    },
    Otp: {
      type: Number,
      trim: true,
    },
    resetOtp: {
      type: Number,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpExpire: {
      type: Number,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userModel);
