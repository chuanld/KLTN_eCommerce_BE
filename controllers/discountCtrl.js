const Vouchers = require('../models/voucherModel')
const Products = require('../models/productModel')

const discountCtrl = {
  getVouchers: async (req, res) => {
    try {
      //console.log(req.query);
      const features = new APIfeatures(Vouchers.find(), req.query)
        .filtering()
        .sorting()
        .paginating()

      const countCalc = new APIfeatures(Vouchers.find(), req.query)
        .filtering()
        .sorting()
      const countTotal = await countCalc.query.count()
      const vouchers = await features.query //Product.find() if not add features for product page

      res.json({
        totalResult: countTotal,
        result: vouchers.length,
        page: req.query.page ? parseInt(req.query.page) : 1,
        vouchers,
      })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  checkValidDiscount: async (req, res) => {
    try {
      const { voucherCode } = req.body
      console.log(voucherCode)
      const voucher = await Vouchers.findOne({ voucherCode })
      if (!voucher) return res.status(400).json({ msg: 'Voucher invalid' })
      if (voucher.voucherExpire.toISOString() < new Date().toISOString()) {
        return res.status(400).json({ msg: 'Voucher expired.' })
      }
      res.json({ msg: 'Voucher activated!', voucher })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getAllProductsDiscount: async (req, res) => {
    try {
      const allproducts = await Products.find()
      const voucher = await Vouchers.findById('624695696e0bbcd712c80369')
      let ListProduct = []
      allproducts.forEach((product) => {
        voucher.voucherProductCategory.forEach((v) => {
          if (product.category === v) ListProduct.push(product)
        })
      })
      res.json({ ListProduct, total: ListProduct.length })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Products.findById(req.params.id)
      if (!product) return res.status(400).json({ msg: 'Product not found' })
      res.json({ product })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  createVoucher: async (req, res) => {
    try {
      const {
        voucherCode,
        voucherDiscount,
        voucherStatus,
        voucherStock,
        voucherProductId,
        voucherProductPublisher,
        voucherProductCategory,
        voucherProductAuthor,
        createdBy,
      } = req.body

      const newVoucher = new Vouchers({
        voucherCode,
        voucherDiscount,
        voucherStatus,
        voucherStock,
        voucherProductId,
        voucherProductPublisher,
        voucherProductCategory,
        voucherProductAuthor,
        createdBy,
      })
      await newVoucher.save()
      res.json({ msg: 'Create voucher successfully!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  updateVoucher: async (req, res) => {
    try {
      const {
        voucherCode,
        voucherDiscount,
        // voucherStatus,
        voucherStock,
        voucherProductId,
        voucherProductPublisher,
        voucherProductCategory,
        voucherProductAuthor,
        modifiedBy,
        voucherEffect,
        voucherExpire,
      } = req.body
      console.log(voucherEffect, voucherExpire)
      const voucher = await Vouchers.findById(req.params.id)
      if (voucherEffect >= voucherExpire) {
        return res
          .status(400)
          .json({ msg: 'Invalid date. Effect must be greater than Expire' })
      }
      // if (voucher.voucherEffect) {
      //   if (voucherExpire <= voucher.voucherEffect.toISOString()) {
      //     return res
      //       .status(400)
      //       .json({ msg: 'Invalid date. Expire must be greater than effect' })
      //   }
      // }

      // if (voucherExpire < new Date().toISOString()) {
      //   return res
      //     .status(400)
      //     .json({ msg: 'Invalid date. Expire must be greater than at now' })
      // }

      await Vouchers.findOneAndUpdate(
        { _id: req.params.id },
        {
          voucherCode,
          voucherDiscount,
          // voucherStatus,
          voucherStock,
          voucherProductId,
          voucherProductPublisher,
          voucherProductCategory,
          voucherProductAuthor,
          modifiedBy,
          voucherEffect,
          voucherExpire,
        }
      )

      res.json({ msg: 'Update voucher successfully!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
  deleteVoucher: async (req, res) => {
    try {
      await Vouchers.findByIdAndDelete({ _id: req.params.id })
      res.json({ msg: 'Delete voucher  successfully!' })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },
}

// Filter, sort and paginate
class APIfeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }
  filtering() {
    const queryObj = { ...this.queryString } //queryString = req.body

    const excludedFields = ['page', 'sort', 'limit', 'skipp']
    excludedFields.forEach((el) => delete queryObj[el])

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => '$' + match
    )

    this.query.find(JSON.parse(queryStr))

    return this
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join('')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }
  paginating() {
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 9
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}
module.exports = discountCtrl
