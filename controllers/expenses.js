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
  const { title, amount,amount_owed, category, dueDate, split_between } = req.body;
  try {
    const expense = await Expense.create({
      admin_id:userId,
      title,
      amount,
      amount_owed,
      category,
      dueDate,
      split_between
    });
    res.status(201).json(expense);
  } catch (error) {
    return res.status(500).json(error);
  }
};
const payAmount = async (req, res) => {
  const userId = req.userId;
  const { transaction_id } = req.body;

  try {
    // ✅ Ensure the transaction exists
    const expense = await Expense.findOne({ "split_between._id": transaction_id });
    if (!expense) throw new Error("Transaction not found");

    // ✅ Update the status of the specific roommate entry
    const updated = await Expense.updateOne(
      { "split_between._id": transaction_id },
      { $set: { "split_between.$.status": "paid" } }
    );

    if (updated.modifiedCount === 0)
      throw new Error("Payment status not updated");

    res.status(200).json({ message: "Payment Successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
module.exports = { getAllTransactions, addTransaction,payAmount, deleteTransaction };
