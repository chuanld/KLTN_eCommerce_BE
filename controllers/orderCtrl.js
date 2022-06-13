const Orders = require("../models/orderModel");
const Users = require("../models/userModel");
const Products = require("../models/productModel");
const Vouchers = require("../models/voucherModel");

const orderCtrl = {
  getOrder: async (req, res) => {
    try {
      const features = new OrdersFeatures(Orders.find(), req.query)
        .filtering()
        .sorting()
        .paginating();
      // const countTotal
      const countCalc = new OrdersFeatures(Orders.find(), req.query)
        .filtering()
        .sorting();
      const countTotal = await countCalc.query.count();
      const orders = await features.query;
      //
      // const orders = await Orders.find();
      res.json({
        page: req.query.page ? parseInt(req.query.page) : 1,
        totalResult: countTotal,
        result: orders.length,
        orders,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createOrder: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("name email");
      if (!user) return res.status(400).json({ msg: "User does not exist" });
      const { cart, orderID, address, name, option, voucherCode } = req.body;
      console.log("---------------------");
      const voucher = await Vouchers.findOne({ voucherCode });
      console.log(voucher?.voucherDiscount);
      if (voucher) {
        cart.forEach((product) => {
          if (voucher.voucherProductId.length !== 0) {
            voucher.voucherProductId.forEach((v) => {
              if (product._id === v) {
                product.price = (product.price * voucher.voucherDiscount) / 100;
                return;
              }
            });
          }

          if (voucher.voucherProductCategory.length !== 0) {
            voucher.voucherProductCategory.forEach((v) => {
              if (product.category === v) {
                product.price = (product.price * voucher.voucherDiscount) / 100;
                return;
              }
            });
          }
          if (voucher.voucherProductAuthor.length !== 0) {
            voucher.voucherProductAuthor.forEach((v) => {
              if (product.author === v) {
                product.price = (product.price * voucher.voucherDiscount) / 100;
                return;
              }
            });
          }
          if (voucher.voucherProductPublisher.length !== 0) {
            voucher.voucherProductPublisher.forEach((v) => {
              if (product.publisher === v) {
                product.price = (product.price * voucher.voucherDiscount) / 100;
                return;
              }
            });
          }
        });
      }
      console.log(cart);
      // console.log(cart, orderID, address, name, option)
      const { _id, email } = user;
      const newOrder = new Orders({
        user_id: _id,
        name,
        email,
        cart,
        orderID,
        address,
        option,
      });

      cart.filter((item) => {
        return sold(item._id, item.quantity, item.sold);
      });
      await newOrder.save();
      res.json({ msg: "Payment success", cart });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Orders.findOne({ _id: req.params.id });
      if (!order)
        return res.status(400).json({ msg: "Update fail, check again." });
      if (status < order.status)
        return res.status(400).json({ msg: "Cannot return previous" });
      if (
        (status < order.status && order.status === 1) ||
        (status > order.status && order.status === 1)
      ) {
        return res.status(400).json({ msg: "Order is invalid" });
      }
      await Orders.findOneAndUpdate({ _id: req.params.id }, { status: status });
      res.json({
        msg: `OrderID ${order.orderID} has update success`,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const sold = async (id, quantity, oldSold) => {
  await Products.findOneAndUpdate(
    { _id: id },
    {
      sold: quantity + oldSold,
    }
  );
};

// Filter, sort and paginate
class OrdersFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString }; //queryString = req.body
    console.log({ before: queryObj });

    const excludedFields = ["count", "page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);
    console.log({ after: queryObj });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(eq|gte|gt|lt|lte|regex)\b/g,
      (match) => "$" + match
    );

    console.log({ queryObj, queryStr });

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

module.exports = orderCtrl;
