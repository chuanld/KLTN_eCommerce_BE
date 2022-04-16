const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Object,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      require: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    countReviews: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 100,
    },
    timeDisc:{
      type: Date
    }
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Products', productSchema)
