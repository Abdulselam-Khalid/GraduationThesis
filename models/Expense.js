// models/Expense.js
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "Type of transaction cannot be empty"],
  },
  amount: {
    type: Number,
    required: [true, "Amount cannot be empty"],
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "paidBy cannot be empty"],
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: [true, "Group Id cannot be empty"],
  },
  description: {
    type: String,
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
