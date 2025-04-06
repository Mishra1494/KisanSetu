const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const productSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    autopopulate: true // Automatically populate the farmer field on queries
  },
  description: String,

  image: {
    url: String,          // Cloudinary image URL
    filename: String      // Public ID or filename on Cloudinary
  }

}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Apply the autopopulate plugin
productSchema.plugin(autopopulate);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
