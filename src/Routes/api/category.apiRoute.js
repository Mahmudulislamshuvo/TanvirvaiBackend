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

_.route("/createcategory").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  createCategory
);
_.route("/getallcategory").get(allCategory);
_.route("/getsinglecategory/:id").get(getSingleCategory);
_.route("/updatecategory/:id").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateCategory
);
_.route("/deletecategory/:id").delete(deleteCategory);

module.exports = _;
