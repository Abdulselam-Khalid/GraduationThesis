const mongoose = require('mongoose')
const Task = require('../models/Task')
const Group = require("../models/Groups");
const User = require("../models/User")

const getMembers = async (req, res) => {
    const userID = req.userID
  try {
    
    const group = await Group.findOne({members:userID}).populate("members", "name email")
    res.status(200).json(group)
  } catch (err) {
    res.status(500).json({error:err.message})
  }
};
// const getGroupTasks = async (req, res) => {
//   const groupId = req.params.groupId;

//   try {
//       // Find the group and get member IDs
//       const group = await Group.findById(groupId);
//       if (!group) {
//           return res.status(404).json({ message: "Group not found" });
//       }

//       // Retrieve tasks assigned to any member of the group
//       const tasks = await Task.find({ assignedTo: { $in: group.members } }).populate("assignedTo", "name email");

//       res.status(200).json(tasks);
//   } catch (err) {
//       res.status(500).json({ error: err.message });
//   }
// };
const getGroupTasks = async (req, res) => {
  try{
    const tasks = await Task.find({groupId:req.params.groupId}).populate("assignedTo", "name email")
    res.status(200).json(tasks)
  }catch(err){
    res.status(500).json({error: err.message})
  }
}
const removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;

  try {
    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: memberId } }, // This removes memberId from members array
      { new: true } // Returns the updated group
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

    // 🔐 Check if the user is already in any group
    const existingGroup = await Group.findOne({ members: user._id });
    if (existingGroup) {
      return res.status(400).json({ message: "User is already a member of another group" });
    }

    group.members.push(user._id);
    await group.save();

    res.status(200).json({ message: "User added to group", group });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {getMembers, getGroupTasks, removeMember, addMember}
