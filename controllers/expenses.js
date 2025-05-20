const Expense = require("../models/Expense.js");

const getAllExpenses = async (req, res) => {
  const { groupId } = req.params;
  try {
    const expenses = await Expense.find({ groupId });
    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = { getAllExpenses };
