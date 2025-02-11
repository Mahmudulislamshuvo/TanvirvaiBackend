const express = require("express");
const { createCategory } = require("../../Controllers/category.controller");
const _ = express.Router();

const { upload } = require("../../Middleware/multer.middleware");

_.route("/createcategory").post(
  upload.fields([{ name: "image", maxCount: 5 }]),
  createCategory
);

module.exports = _;
