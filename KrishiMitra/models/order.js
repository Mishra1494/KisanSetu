const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: Number,
    totalPrice: Number
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
