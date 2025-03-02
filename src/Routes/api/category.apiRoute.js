const express = require("express");
const {
  createCategory,
  allCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../../Controllers/category.controller");
const _ = express.Router();

const { upload } = require("../../Middleware/multer.middleware");

_.route("/category/create").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  createCategory
);
_.route("/category/getall").get(allCategory);
_.route("/category/single/:id").get(getSingleCategory);
_.route("/category/update/:id").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateCategory
);
_.route("/category/delete/:id").delete(deleteCategory);

module.exports = _;
