const express = require("express");
const Task = require("../models/Task");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

// // POST /api/tasks — Add a task
// router.post('/', async (req, res) => {
//   const { title, description, assignedTo, dueDate } = req.body;

//   try {
//     const task = await Task.create({
//       title,
//       description,
//       assignedTo,
//       dueDate,
//     });

//     res.status(201).json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET /api/tasks — Get all tasks
// router.get('/', async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedTo: req.userID }); // Get tasks for the logged-in user
//     res.status(200).json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PUT /api/tasks/:id — Update task
// router.put('/:id', async (req, res) => {
//   const { title, description, completed, dueDate } = req.body;

//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       { title, description, completed, dueDate },
//       { new: true } // Return the updated task
//     );

//     if (!task) return res.status(404).json({ message: "Task not found" });

//     res.status(200).json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE /api/tasks/:id — Delete a task
// router.delete('/:id', async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(req.params.id);

//     if (!task) return res.status(404).json({ message: "Task not found" });

//     res.status(200).json({ message: "Task deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
