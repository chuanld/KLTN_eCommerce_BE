const mongoose = require('mongoose')

const VoucherSchema = new mongoose.Schema(
  {
    voucherCode: String,
    voucherDiscount: Number,
    voucherStatus: {
      type: Boolean,
      default: false,
    },
    voucherStock: Number,
    voucherProductId: Array,
    voucherProductPublisher: Array,
    voucherProductCategory: Array,
    voucherProductAuthor: Array,
    createdBy: String,
    modifiedBy: String,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Vouchers', VoucherSchema)
