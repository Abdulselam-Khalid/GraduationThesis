const Expense = require("../models/Expense.js");

const getAllTransactions = async (req, res) => {
  const userId = req.userID;
  try {
    const expenses = await Expense.find({ "split_between.roommate_id": userId });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const addTransaction = async (req, res) => {
  const userId = req.userID;
  const { title, amount, category, dueDate, split_between } = req.body;
  try {
    const expense = await Expense.create({
      admin_id:userId,
      title,
      amount,
      category,
      dueDate,
      split_between
    });
    res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const deleteTransaction = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense)
      return res.status(404).json({ message: "transaction not found" });
    return res
      .status(200)
      .json({ message: "Transaction removed successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports = { getAllTransactions, addTransaction, deleteTransaction };
