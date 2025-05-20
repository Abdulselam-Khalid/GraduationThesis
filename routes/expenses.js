const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getAllExpenses } = require("../controllers/expenses");

router.use(authMiddleware);

router.route("/:groupId").get(getAllExpenses);

module.exports = router;
