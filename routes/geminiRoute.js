const express = require("express");
const { startChat } = require("../controllers/geminiController");

const router = express.Router();

router.post("/chat", startChat);

module.exports = router;
