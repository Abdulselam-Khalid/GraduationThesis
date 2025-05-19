const mongoose = require("mongoose");
const Task = require("../models/Task");
const Group = require("../models/Groups");
const User = require("../models/User");

// ✅ Get group info including member details and their roles
const getMembers = async (req, res) => {
  const userId = req.userID;
  try {
    const group = await Group.findOne({ "members.userId": userId }).populate("members.userId", "name email");
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const formattedMembers = group.members.map(m => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
    }));

    res.status(200).json({ ...group.toObject(), members: formattedMembers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create a group with the user as admin
const createGroup = async (req, res) => {
  const userId = req.userID;
  const { name } = req.body;

  try {
    const existingGroup = await Group.findOne({ "members.userId": userId });
    if (existingGroup) {
      throw new Error("User already has a group");
    }

    const group = await Group.create({
      name,
      members: [{ userId, role: "admin" }],
      createdBy: userId,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all tasks associated with a group
const getGroupTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ groupId: req.params.groupId }).populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Remove a member from group and delete their tasks
const removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { userId: memberId } } },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Task.deleteMany({ assignedTo: memberId });

    res.status(200).json({ message: "Member removed successfully", group });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add a new member to the group with "member" role
const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const alreadyInGroup = await Group.findOne({ "members.userId": user._id });
    if (alreadyInGroup) {
      return res.status(400).json({ message: "User is already a member of another group" });
    }

    group.members.push({ userId: user._id, role: "member" });
    await group.save();

    res.status(200).json({ message: "User added to group", group });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete a group and its tasks
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const response = await Group.findOneAndDelete({ _id: groupId });
    if (!response) {
      return res.status(404).json({ message: "Group not found" });
    }

    const task = await Task.deleteMany({ groupId: groupId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Successfully deleted group and tasks" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMembers,
  createGroup,
  getGroupTasks,
  removeMember,
  addMember,
  deleteGroup,
};
