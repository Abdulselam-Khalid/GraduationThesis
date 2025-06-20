const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a task title"],
  },
  description: {
    type: String,
    required: [true, "Please provide a task description"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please assign the task to a user"]
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Group',
    required:[true, 'User must be a member of a group']
  },
  dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  completed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
