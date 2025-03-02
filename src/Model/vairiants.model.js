// models/variant.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  variantType: {
    type: String,
    required: true, // kg, gram, litre, ml, etc.
  },
  value: {
    type: Schema.Types.Mixed, //(e.g., "2 kg", "5 liters")
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("variant", variantSchema);
