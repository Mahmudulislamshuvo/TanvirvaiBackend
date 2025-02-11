const { apiError } = require("../utils/apiError");
const { apiResponse } = require("../utils/apiResponse");

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
    // Upload image to clodinary. Need to set it up first
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

module.exports = { createCategory };
