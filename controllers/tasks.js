const Task = require("../models/Task");
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.userID }); // Get tasks for the logged-in user
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createTask = async (req, res) => {
  const { title, description, assignedTo, groupId, dueDate } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      assignedTo,
      groupId,
      dueDate,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateTask = async (req, res) => {
  const { title, description, completed, dueDate } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, completed, dueDate },
      { new: true } // Return the updated task
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
