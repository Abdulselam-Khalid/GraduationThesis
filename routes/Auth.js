const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  registerUser,
  login,
  findUser,
  getAllUsers,
} = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/users
router.get("/users", getAllUsers);

// GET /api/auth/:id (must be last to avoid conflicts)
router.get("/:id", findUser);

module.exports = router;
