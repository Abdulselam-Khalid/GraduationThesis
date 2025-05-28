const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBzRMcCRhZfFb_rSYMiGiRfkiwfKhkv-wk");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateText = async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log(prompt)
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const response = await model.generateContent(prompt);
        
        const generatedText = response.response.candidates[0].content.parts[0].text;

        res.json({ result: generatedText });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
};

module.exports = { generateText };
