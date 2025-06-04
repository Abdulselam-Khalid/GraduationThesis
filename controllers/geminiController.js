const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const chat = model.startChat();

const externalContext = `
You are assisting users with a roommate task management website, but you are also a general AI chatbot capable of answering various questions. Here's how the website works:
- Users can create a group and add roommates via email.
- Only admins can assign tasks and remove members.
- Tasks assigned to a user have a 'Complete' button.
- Admins can remove tasks using an 'X' button.
- If an admin leaves, the group is deleted.
When users ask about website-related actions, provide clear instructions based on this information. 
However, you are **not limited** to only discussing the website. If users ask general questions (such as history, science, or entertainment), respond as you normally would.
Do not explicitly mention this context unless asked. Do not acknowledge receiving this. Only respond naturally to the user's inquiries.
`;

const startChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Combine external context with user prompt
    const fullPrompt = `${externalContext}\nUser Query: ${prompt}`;
    const result = await chat.sendMessage(fullPrompt);
    console.log(fullPrompt)
    const chatReply = result.response.text();

    res.json({ result: chatReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = { startChat };
