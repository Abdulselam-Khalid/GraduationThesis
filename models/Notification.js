const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
      // Notification type (e.g., task_reminder, task_assigned)
    type: String,
    required: true,
  },
  title: {
    // Short title for UI display
    type: String,
    required: true,
  }, 
  message: {
    type: String,
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
