const mongoose = require("mongoose");
const { Schema } = mongoose;

const productModel = new Schema(
  {
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
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    productType: {
      name: {
        type: String,
        trim: true,
      },
      allowedVariants: [
        {
          type: String,
          enum: ["kg", "gram", "litre", "ml", "quantity"],
        },
      ],
    },
    variants: [
      {
        variantType: {
          type: String,
          required: true, // Variant type like kg, litre, etc.
        },
        value: {
          type: Schema.Types.Mixed, // Value could be a number (e.g., 1kg, 2 litres) or a string
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("product", productModel);
