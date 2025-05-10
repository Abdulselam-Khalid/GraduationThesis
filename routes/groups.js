const express = require("express");
const {getMembers, createGroup, getGroupTasks, removeMember, addMember, deleteGroup} = require('../controllers/groups')
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

//GET /api/groups
router.route('/').get(getMembers).post(createGroup)

//GET /api/groups/:groupId/tasks
router.route('/:groupId/tasks').get(getGroupTasks)

//DELETE //api/groups/:groupId/members/:memberId
router.route('/:groupId/members/:memberId').delete(removeMember)

//DELETE //api/groups/:groupId
router.route('/:groupId').delete(deleteGroup);

//POST //api/groups/:groupId/addMember
router.post('/:groupId/addMember', addMember);

module.exports = router