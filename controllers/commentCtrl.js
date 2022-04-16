const Comments = require('../models/commentModel')

const commentCtrl = {
  getComments: async (req, res) => {
    try {
      const features = new APIfeatures(
        Comments.find({ product_id: req.params.id }),
        req.query
      )
        .filtering()
        .sorting()
        .paginating()
      const countCalc = new APIfeatures(
        Comments.find({ product_id: req.params.id }),
        req.query
      )
        .filtering()
        .sorting()
      const comments = await features.query
      const countTotal = await countCalc.query.count()
      res.json({
        totalResult: countTotal,
        result: comments.length,
        page: req.query.page ? parseInt(req.query.page) : 1,
        comments,
      })
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
module.exports = commentCtrl
