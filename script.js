/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");
const sendBtn = document.getElementById("sendBtn");

const appConfig = window.APP_CONFIG || {};
const workerUrl = appConfig.WORKER_URL || "";

// Clear scope so the chatbot stays beauty-focused and politely refuses unrelated topics.
const systemPrompt = {
  role: "system",
  content:
    "You are a L'Oreal beauty advisor. Only answer questions about L'Oreal products, beauty routines, skin care, hair care, makeup, fragrance, ingredient basics, and product recommendations. If a user asks about unrelated topics, politely refuse and redirect them to a L'Oreal beauty question. Keep answers short, clear, and beginner-friendly.",
};

// Conversation history gives multi-turn context (for example remembering the user's skin type or name).
const messages = [systemPrompt];

function createMessageBubble(text, role) {
  const message = document.createElement("div");
  message.className = `message ${role}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "L'Oreal Assistant";

  const messageText = document.createElement("div");
  messageText.textContent = text;

  message.appendChild(label);
  message.appendChild(messageText);

  return message;
}

function updateLatestQuestion(question) {
  latestQuestion.textContent = `Latest question: ${question}`;
}

function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessageToChat(content, role) {
  const bubble = createMessageBubble(content, role);
  chatWindow.appendChild(bubble);
  scrollChatToBottom();
}

function showAssistantTyping() {
  const typingBubble = createMessageBubble(
    "Thinking about the best L'Oreal answer...",
    "assistant",
  );
  typingBubble.id = "typingBubble";
  chatWindow.appendChild(typingBubble);
  scrollChatToBottom();
}

function removeTypingIndicator() {
  const typingBubble = document.getElementById("typingBubble");
  if (typingBubble) {
    typingBubble.remove();
  }
}

function setFormDisabled(isDisabled) {
  sendBtn.disabled = isDisabled;
  userInput.disabled = isDisabled;
}

async function fetchFromCloudflareWorker() {
  const response = await fetch(workerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error(`Worker request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function fetchChatResponse() {
  if (workerUrl) {
    return fetchFromCloudflareWorker();
  }

  throw new Error("No WORKER_URL configured.");
}

chatWindow.innerHTML = "";
addMessageToChat(
  "Welcome to L'Oreal Beauty Chat. Ask about products, routines, recommendations, or ingredients.",
  "assistant",
);

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) {
    return;
  }

  updateLatestQuestion(userText);
  addMessageToChat(userText, "user");
  messages.push({ role: "user", content: userText });

  userInput.value = "";
  setFormDisabled(true);
  showAssistantTyping();

  try {
    const assistantText = await fetchChatResponse();
    const safeText =
      assistantText || "I could not generate an answer. Please try again.";

    removeTypingIndicator();
    addMessageToChat(safeText, "assistant");
    messages.push({ role: "assistant", content: safeText });
  } catch (error) {
    removeTypingIndicator();
    addMessageToChat(
      "I could not connect to the AI service. Check your WORKER_URL and Cloudflare Worker deployment, then try again.",
      "assistant",
    );
    console.error(error);
  } finally {
    setFormDisabled(false);
    userInput.focus();
  }
});
