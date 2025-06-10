const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllTransactions,
  addTransaction,
  payAmount,
  deleteTransaction,
} = require("../controllers/expenses");

router.use(authMiddleware);

router.route("/").get(getAllTransactions).post(addTransaction).patch(payAmount);

router.route("/:id").delete(deleteTransaction);

module.exports = router;
