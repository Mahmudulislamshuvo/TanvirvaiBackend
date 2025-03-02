const express = require("express");
const { createPrduct } = require("../../Controllers/product.controller");
const _ = express.Router();

_.route("/product/create").post(createPrduct);

module.exports = _;
