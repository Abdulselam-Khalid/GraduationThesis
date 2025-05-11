// models/Expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
