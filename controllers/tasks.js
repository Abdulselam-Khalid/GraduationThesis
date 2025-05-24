const Task = require("../models/Task");
const Notification = require("../models/Notification")
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
    // ✅ 1. Create the task
    const task = await Task.create({
      title,
      description,
      assignedTo,
      groupId,
      dueDate,
    });

    // ✅ 2. Create a notification for the assigned user
    const notification = new Notification({
      userId: assignedTo,           // user ID
      type: "task-assigned",          // notification type
      title: "New Task Assigned",
      message: `You've been assigned a new task: "${title}"`,
      taskId: task._id,
    });

    await notification.save(); 

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
const completeTask = async (req, res) => {
  const { completed } = req.body;

  try {
    // ✅ Find the task first
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    console.log(task)
    if (!task) throw new Error("Task not found");

    // ✅ Update the task status
    const updated = await Task.updateOne(
      { _id: req.params.id },
      { $set: { completed } }
    );

    if (updated.modifiedCount === 0)
      throw new Error("Task not updated");

    // ✅ Create a notification
    const notification = new Notification({
      groupId: task.groupId, // Or another user who needs to be notified
      type: "task-completed",
      title: "Task Completed",
      message: `${task.assignedTo.name} marked "${task.title}" as done`,
      taskId: task._id,
    });

    await notification.save(); // ✅ Save notification

    res.status(200).json({ message: "Task updated and notification sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { getTasks, createTask, updateTask, deleteTask, completeTask };
