const express = require("express");
const {getMembers, getGroupTasks, removeMember, addMember} = require('../controllers/groups')
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

//GET /api/groups
router.route('/').get(getMembers)

//GET /api/groups/:groupId/tasks
router.route('/:groupId/tasks').get(getGroupTasks)

//DELETE //api/groups/:groupId/members/:memberId
router.route('/:groupId/members/:memberId').delete(removeMember)

//POST //api/groups/:groupId/addMember
router.post('/:groupId/addMember', addMember);

module.exports = router