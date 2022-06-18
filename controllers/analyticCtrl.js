const Vouchers = require("../models/voucherModel");
const Category = require("../models/categoryModel");
const Products = require("../models/productModel");
const Comments = require("../models/commentModel");
const Orders = require("../models/orderModel");
const Users = require("../models/userModel");

const AnalyticCtrl = {
  getAnalytics: async (req, res) => {
    try {
      const totalProducts = new APIfeatures(
        Products.find(),
        req.query
      ).filtering();
      const totalCategories = new APIfeatures(
        Category.find(),
        req.query
      ).filtering();

      const { start, end } = req.query;

      const totalOrders = new APIfeatures(
        Orders.find({
          // status: 5,

          createdAt: {
            $gte: start ? new Date(start) : new Date(1900, 01, 01),
            $lte: end ? new Date(end) : new Date(2200, 01, 01),
          },
        }),
        req.query
      ).filtering();

      const totalAccount = new APIfeatures(
        Users.find({
          createdAt: {
            $gte: start ? new Date(start) : new Date(1900, 01, 01),
            $lte: end ? new Date(end) : new Date(2200, 01, 01),
          },
        }),
        req.query
      ).filtering();

      const products = await totalProducts.query;
      const categories = await totalCategories.query;
      const orders = await totalOrders.query;
      const vouchers = await Vouchers.find();
      const users = await totalAccount.query;

      res.json({
        users: users,
        // total: orders.length,
        products: products,
        categories: categories,
        orders: orders,
        vouchers: vouchers,
        msg: "Get Analytics success",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

// Filter, sort and paginate
class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.body

    const excludedFields = ["page", "sort", "limit", "skipp"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join("");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = AnalyticCtrl;
