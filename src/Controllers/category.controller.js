const { apiError } = require("../utils/apiError");
const { apiResponse } = require("../utils/apiResponse");
const { upload } = require("../Middleware/multer.middleware");
const categoryModel = require("../Model/category.model");
const fs = require("fs");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res
        .status(401)
        .json(
          new apiError(false, 401, null, `Category Credentials Missing!`, true)
        );
    }
    // Geting Img path
    const allImages = req.files;
    const ImgPath = allImages.image[0].path;
    // spliting the path and take last index
    const filepath = ImgPath.split("\\").pop();

    // name exist?
    const isAlreadyExist = await categoryModel.findOne({ name });
    if (isAlreadyExist) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, `Category already exist`, true));
    }

    const saveCategory = await categoryModel.create({
      name,
      description,
      image: `${process.env.DOMAIN_NAME}/${filepath}`,
    });
    if (saveCategory) {
      return res
        .status(201)
        .json(
          new apiResponse(
            true,
            saveCategory,
            "Category Created successfully",
            false
          )
        );
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(
          false,
          500,
          null,
          `error from createCategory controller ${error}`,
          true
        )
      );
  }
};

const allCategory = async (req, res) => {
  try {
    const allCategoryList = await categoryModel.find({});
    if (!allCategoryList?.length) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, `Category not found`, true));
    }
    return res
      .status(201)
      .json(
        new apiResponse(true, allCategoryList, "All Category retrived", false)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(
          false,
          500,
          null,
          `error from allCategory controller ${error}`,
          true
        )
      );
  }
};

const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const findCategory = await categoryModel.findById(id);
    if (!findCategory) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, `Category not found`, true));
    }
    return res
      .status(201)
      .json(
        new apiResponse(true, findCategory, " Single Category retrived", false)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError(
          false,
          500,
          null,
          `error from getSingleCategory controller ${error}`,
          true
        )
      );
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res
        .status(401)
        .json(new apiError(false, 401, null, `Category not found`, true));
    }

    // Update only the fields that are provided
    if (name !== undefined) {
      category.name = name;
    }
    if (description !== undefined) {
      category.description = description;
    }

    //  Check if a new image file is provided in the request
    if (req.files && req.files.image && req.files.image.length > 0) {
      const ImgPath = req.files.image[0].path;
      const filepath = ImgPath.split("\\").pop();
      const newImagePath = `${process.env.DOMAIN_NAME}/${filepath}`;

      //Delete the previous image from the local store if it exists
      if (category.image) {
        const oldFileName = category.image.split("/").pop();
        const oldFilePath = `public/uploads/${oldFileName}`;

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old image: ${oldFilePath}`);
        } else {
          console.log(`Old image not found: ${oldFilePath}`);
        }
      }

      // Update the image field with the new image URL
      category.image = newImagePath;
    }

    // Save the updated category document
    await category.save();

    return res
      .status(201)
      .json(
        new apiResponse(true, category, "Single Category retrieved", false)
      );
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json(
        new apiError(
          false,
          500,
          null,
          `Error from updateCategory controller: ${error.message}`,
          true
        )
      );
  }
};

module.exports = {
  createCategory,
  allCategory,
  getSingleCategory,
  updateCategory,
};
