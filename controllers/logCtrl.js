const Logs = require("../models/logModel");

const logCtrl = {
  getLog: async (req, res) => {
    try {
      const logFilter = new APIfeatures(Logs.find(), req.query)
        .filtering()
        .sorting();
      const logs = await logFilter.query;
      res.json({ logs });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateLog: async (req, res) => {
    try {
      const log = await Logs.findById(req.params.id);
      if (!log) return res.status(400).json({ msg: "isRead fail" });
      const timeAt = new Date();
      await Logs.findByIdAndUpdate(
        { _id: req.params.id },
        {
          readedAt: timeAt,
          isRead: true,
        }
      );
      res.json({ msg: "sucess" });
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
module.exports = logCtrl;
