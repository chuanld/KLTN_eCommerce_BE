const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    logType: String,
    logBy: Object,
    logAction: Object,

    logObject: Object,
    readedAt: {
      type: Date,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Logs", LogSchema);
