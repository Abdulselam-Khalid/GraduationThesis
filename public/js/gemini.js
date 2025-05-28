// Initialize chat history array
let chatHistory = [];

// Function to add a message to the chat
const addMessage = (message, isUser = false) => {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.innerHTML = message;

  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add to history
  chatHistory.push({ message, isUser });
};

// Function to handle sending messages
const sendMessage = async () => {
  const aiPrompt = document.getElementById("aiPrompt");
  const message = aiPrompt.value.trim();

  if (!message) return;

  // Add user message to chat
  addMessage(message, true);

  // Clear input
  aiPrompt.value = "";

  try {
    const response = await fetch("http://localhost:5000/api/gemini/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch response");

    const generatedText = await response.json();
    addMessage(formatMarkdown(generatedText.result));
  } catch (error) {
    console.error(error);
    addMessage("Sorry, I encountered an error. Please try again.");
  }
};

// Function to handle AI response
const fetchAiResponse = () => {
  sendMessage();
};

// Chat bubble functionality
const initChatBubble = () => {
  const chatBubble = document.getElementById("chatBubble");
  const chatBubbleHeader = document.getElementById("chatBubbleHeader");
  const chatBubbleClose = document.getElementById("chatBubbleClose");
  const aiPrompt = document.getElementById("aiPrompt");

  // Toggle chat bubble
  const toggleChat = () => {
    chatBubble.classList.toggle("expanded");
    if (chatBubble.classList.contains("expanded")) {
      aiPrompt.focus();
    }
  };

  // Close chat when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !chatBubble.contains(e.target) &&
      chatBubble.classList.contains("expanded")
    ) {
      chatBubble.classList.remove("expanded");
    }
  });

  // Prevent closing when clicking inside the chat
  chatBubble.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Toggle chat on bubble click
  chatBubble.addEventListener("click", (e) => {
    if (e.target === chatBubble || e.target === chatBubbleHeader) {
      toggleChat();
    }
  });

  // Close button handler
  chatBubbleClose.addEventListener("click", () => {
    chatBubble.classList.remove("expanded");
  });

  // Handle Enter key
  aiPrompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
};

// Initialize chat features
document.addEventListener("DOMContentLoaded", () => {
  initChatBubble();
  addMessage("Hello! How can I help you today?");
});

function formatResponse(text) {
  return text.replace(/\*(.*?)\*/g, "<strong>$1</strong>"); // Convert asterisks to bold HTML
}
