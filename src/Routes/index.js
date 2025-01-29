const express = require("express");
const _ = express.Router();
const { apiError } = require("../utils/apiError");
const baseApi = process.env.BASE_API;
const SignUpRoute = require("./api/user.apiRoutes");

_.use(baseApi, SignUpRoute);

// For invalid Route
_.use("*", (req, res) => {
  res
    .status(405)
    .json(new apiError(false, null, "Your Rooute is Invalid", true));
});

module.exports = _;
