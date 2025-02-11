const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  colors: [
    {
      colorName: {
        type: String,
        trim: true,
      },
      sizes: [
        {
          size: {
            type: String,
            trim: true,
          },
          stock: {
            type: Number,
            min: 0,
          },
        },
      ],
    },
  ],
  rating: {
    type: Number,
    defult: 0,
    max: 5,
  },
  solditem: {
    type: Number,
  },
  reviews: [
    {
      type: String,
      trim: true,
    },
  ],
  avatar: {
    type: String,
  },
});

module.exports = mongoose.model("products", productSchema);
