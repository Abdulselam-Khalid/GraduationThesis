const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllTransactions,
  getTransactions,
  addTransaction,
  payAmount,
  deleteTransaction,
} = require("../controllers/expenses");

router.use(authMiddleware);

router.route("/admin").get(getAllTransactions);

router.route("/").get(getTransactions).post(addTransaction).patch(payAmount);

router.route("/:id").delete(deleteTransaction);

module.exports = router;
