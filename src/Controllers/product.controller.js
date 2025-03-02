const { apiError } = require("../utils/apiError");
const { apiResponse } = require("../utils/apiResponse");
const productModel = require("../Model/prduct.model");

const createPrduct = async (req, res) => {
  try {
    const { title, description, colors, rating, reviews } = req.body;
    console.log(title, description, colors, rating, reviews);
    return;
  } catch (error) {
    return res
      .status(500)
      .json(new apiError(false, 500, null, `error from ${error}`, true));
  }
};

module.exports = { createPrduct };
