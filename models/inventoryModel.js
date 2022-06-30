const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    productId: String,
    productStock: Number,
    // productSold: Number,
    importBy: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventories", inventorySchema);
