const express = require("express");
const { generateText } = require("../controllers/geminiController");

const router = express.Router();

router.post("/generate", generateText);

module.exports = router;
