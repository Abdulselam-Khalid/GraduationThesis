const express = require("express");
const Task = require("../models/Task");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require("../controllers/tasks");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask).patch(completeTask);

module.exports = router;
