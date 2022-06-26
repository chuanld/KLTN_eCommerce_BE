const Products = require("../models/productModel");
const Categories = require("../models/categoryModel");
const Banners = require("../models/bannerModel");

// CRUD with products
const productCtrl = {
  getProducts: async (req, res) => {
    try {
      //console.log(req.query);
      const features = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting()
        .paginating();

      const countCalc = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting();
      const countTotal = await countCalc.query.count();
      const products = await features.query; //Product.find() if not add features for product page

      res.json({
        totalResult: countTotal,
        result: products.length,
        page: req.query.page ? parseInt(req.query.page) : 1,
        products,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const allproducts = await Products.find();
      res.json({
        allproducts,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getProductById: async (req, res) => {
    try {
      const product = await Products.findById(req.params.id);
      if (!product) return res.status(400).json({ msg: "Product not found" });
      res.json({ product });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProduct: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        content,
        description,
        images,
        category,
        author,
        publisher,
        sold,
        stock,
      } = req.body;
      if (!images) return res.status(400).json({ msg: "No image upload" });

      const product = await Products.findOne({ product_id });
      if (product)
        return res.status(400).json({ msg: "This book is already exist!" });

      const newProduct = new Products({
        product_id,
        title,
        price,
        content,
        description,
        images,
        category,
        author,
        publisher,
        sold,
        stock,
      });
      await newProduct.save();
      res.json({ msg: "Create product successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const {
        title,
        price,
        content,
        description,
        images,
        category,
        author,
        publisher,
        sold,
        stock,
        discount,
      } = req.body;
      if (!images) return res.status(400).json({ msg: "No image upload" });

      await Products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title,
          price,
          content,
          description,
          images,
          category,
          author,
          publisher,
          sold,
          stock,
          discount,
        }
      );

      res.json({ msg: "Update product successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      await Products.findByIdAndDelete({ _id: req.params.id });
      res.json({ msg: "Delete product in database successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createBanner: async (req, res) => {
    try {
      const { banner_id, title, images, pageOf } = req.body;
      if (!images) return res.status(400).json({ msg: "No image upload" });

      const banner = await Banners.findOne({ banner_id });
      if (banner)
        return res.status(400).json({ msg: "This book is already exist!" });

      const newBanner = new Banners({
        banner_id,
        title,
        images,
        pageOf,
      });
      await newBanner.save();
      res.json({ msg: "Create banner successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getListBanners: async (req, res) => {
    try {
      const banners = await Banners.find();
      res.json({
        banners,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  reviews: async (req, res) => {
    try {
      const { rating } = req.body;
      if (rating && rating !== 0) {
        const product = await Products.findById(req.params.id);
        if (!product)
          return res.status(400).json({ msg: "This book does not exist." });
        let num = product.countReviews;
        let rate = product.rating;
        await Products.findOneAndUpdate(
          { _id: req.params.id },
          {
            rating: rate + rating,
            countReviews: num + 1,
          }
        );
        res.json({ msg: "Rating success. Thanks you" });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  discount: async (req, res) => {
    try {
      const id = req.params.id;
      const { newDiscount } = req.body;
      const product = await Products.find({ _id: id });
      console.log(newDiscount);
      if (!product)
        return res.status(400).json({ msg: "This book does not exist" });
      await Products.findOneAndUpdate(
        { _id: id },
        {
          discount: newDiscount,
        }
      );
      res.json({ msg: "Change discount success" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatePriceAllProduct: async (req, res) => {
    try {
      const products = await Products.find();
      if (products.length === 0) return res.status(400).json({ msg: "fail" });
      // products.forEach((product)=>{
      //   await Products.findByIdAndUpdate(
      //     { _id: product._id },
      //     { price: product.price * 1000 },
      //   )
      // })
      for (const product of products) {
        await Products.findByIdAndUpdate(
          { _id: product._id },
          { price: product.price * 1000 }
        );
      }
      res.json({ msg: "success" });
    } catch (err) {}
  },
  updateCategoryAllProduct: async (req, res) => {
    try {
      const products = await Products.find();
      if (products.length === 0)
        return res.status(400).json({ msg: "fail-prod" });
      const categories = await Categories.find();
      if (categories.length === 0)
        return res.status(400).json({ msg: "fail-cate" });

      for (const product of products) {
        for (const category of categories) {
          if (product.category === category.name) {
            await Products.findByIdAndUpdate(
              { _id: product._id },
              { category: category._id.toString() }
            );
          }
        }
      }
      res.json({ msg: "success" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  evenDiscount: async (req, res) => {
    try {
      const { action } = req.body.formValues;
      const { discount } = req.body.formValues;
      if (action === "discount-all") {
        await Products.updateMany({}, { discount: 100 - discount });
        return res.json({ msg: "Discount All Books success" });
      }
      if (action === "discount-author") {
        const { author } = req.body.formValues;
        await Products.updateMany(
          { author: author },
          { discount: 100 - discount }
        );
        return res.json({ msg: `Discount Books of ${author} success` });
      }
      if (action === "discount-category") {
        const { category } = req.body.formValues;
        await Products.updateMany(
          { category: category },
          { discount: 100 - discount }
        );
        return res.json({ msg: `Discount Books of ${category} success` });
      }
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

module.exports = productCtrl;
