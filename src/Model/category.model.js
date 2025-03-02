// models/category.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const categoryModel = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  product: [
    {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  isActive: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("category", categoryModel);
