const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Rent", "Utilities", "Groceries", "Other"],
    required: true,
  },
  date_uploaded: { type: Date, default: Date.now },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from nowy
  },
  split_between: [
    {
      roommate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: { type: String, enum: ["pending", "paid"], default: "pending" },
    },
  ],
});

module.exports = mongoose.model("Expense", ExpenseSchema);
