const express = require("express");
const _ = express.Router();
const { apiError } = require("../utils/apiError");
const baseApi = process.env.BASE_API;
const SignUpRoute = require("./api/user.apiRoutes");
const productRoute = require("./api/product.ApiRoute");
const categoryRoute = require("./api/category.apiRoute");

_.use(baseApi, SignUpRoute);
_.use(baseApi, productRoute);
_.use(baseApi, categoryRoute);

// For invalid Route
_.use("*", (req, res) => {
  res
    .status(405)
    .json(new apiError(false, null, "Your Rooute is Invalid", true));
});

module.exports = _;
