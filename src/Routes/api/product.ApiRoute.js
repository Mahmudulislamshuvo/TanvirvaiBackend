const express = require("express");
const { createPrduct } = require("../../Controllers/product.controller");
const _ = express.Router();

_.route("/productdetails").post(createPrduct);

module.exports = _;
