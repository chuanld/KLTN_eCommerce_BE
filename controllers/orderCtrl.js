const Orders = require("../models/orderModel");
const Users = require("../models/userModel");
const Products = require("../models/productModel");
const Vouchers = require("../models/voucherModel");
// import dateFormat, { masks } from "dateformat";

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
  payVnpay: async (req, res, next) => {
    try {
      var ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      var dateFormat = require("dateformat");

      var tmnCode = process.env.vnp_TmnCode;
      var secretKey = process.env.vnp_HashSecret;
      var vnpUrl = process.env.vnp_Url;
      var returnUrl = process.env.vnp_ReturnUrl;

      var date = new Date();

      var createDate = dateFormat(date, "yyyymmddHHmmss");
      var orderId = dateFormat(date, "HHmmss");
      var amount = req.body.amount;
      var bankCode = req.body.bankCode;

      var orderInfo = req.body.orderDescription;
      var orderType = req.body.orderType;
      var locale = req.body.language;
      if (locale === null || locale === "") {
        locale = "vn";
      }
      var currCode = "VND";
      var vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }
      console.log(vnp_Params);
      vnp_Params = sortObject(vnp_Params);

      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
      console.log(vnpUrl);
      res.redirect(vnpUrl);
      // res.json({ msg: vnpUrl });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  payVnpayCallback: async (req, res) => {
    try {
      var vnp_Params = req.query;
      var secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);
      var config = require("config");
      var secretKey = config.get("vnp_HashSecret");
      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        var orderId = vnp_Params["vnp_TxnRef"];
        var rspCode = vnp_Params["vnp_ResponseCode"];
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        res.status(200).json({ RspCode: "00", Message: "success" });
      } else {
        res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
      }
    } catch (error) {}
  },
  payVnpayReturn: async (req, res) => {
    try {
      var vnp_Params = req.query;

      var secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = sortObject(vnp_Params);

      var config = require("config");
      var tmnCode = config.get("vnp_TmnCode");
      var secretKey = config.get("vnp_HashSecret");

      var querystring = require("qs");
      var signData = querystring.stringify(vnp_Params, { encode: false });
      var crypto = require("crypto");
      var hmac = crypto.createHmac("sha512", secretKey);
      var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

        res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
      } else {
        res.render("success", { code: "97" });
      }
    } catch (err) {}
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
