const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    // description:{
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    product_id: {
      type: String,
      // required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      // required: true,
    },
    // like: {
    //   type: Number,
    //   default: 0,
    // },
    reply: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Comments', commentSchema)
