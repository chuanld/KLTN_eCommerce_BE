const Category = require("../models/categoryModel");
const Products = require("../models/productModel");

const categoryCtrl = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(400).json({ msg: "Category not found" });
      res.json({ category });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createCategory: async (req, res) => {
    try {
      //Only Admin can manage Categories
      const { name } = req.body;
      const category = await Category.findOne({ name });
      if (category)
        return res.status(400).json({ msg: "This category already exists" });

      const newCategory = new Category({ name });

      await newCategory.save();
      res.json({ msg: "Create Cagatory success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      //Delete category by name (Phòng hờ)
      // const { name } = req.body;
      // const category = await Category.findOne({ name });

      // if (!category)
      //   return res.status(400).json({ msg: "Category not found!" });

      // const newCategory = delete Category({ name });
      // res.json({ msg: "Delete category successfully!" });

      //Delete category by id
      const products = await Products.find({ category: req.params.id });
      if (products.length > 0)
        return res
          .status(400)
          .json({ msg: "This category already exists contain product" });
      await Category.findByIdAndDelete(req.params.id);
      res.json({ msg: "Delete category successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateCategory: async (req, res) => {
    try {
      //Update category by id and name
      const { name } = req.body;
      await Category.findOneAndUpdate({ _id: req.params.id }, { name });
      res.json({ msg: "Update category successfully!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = categoryCtrl;
