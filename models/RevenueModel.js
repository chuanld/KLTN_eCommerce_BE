const mongoose = require('mongoose')

const RevenueSchema = new mongoose.Schema({
  productId,
  buyAt,
  income,
  quantity,
})

module.exports = mongoose.model('Revenues', RevenueSchema)
