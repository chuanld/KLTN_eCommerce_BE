const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema(
  {
    banner_id: {
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
    images: {
      type: Object,
      required: true,
    },
    pageOf: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Banners', BannerSchema)
