const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const AI_MODEL = import.meta.env.VITE_AI_MODEL || "openai/gpt-3.5-turbo";

const chatMessages = document.getElementById("chat-messages") as HTMLDivElement;
const userInput = document.getElementById("user-input") as HTMLInputElement;
const sendButton = document.getElementById("send-button") as HTMLButtonElement;

interface Message {
  role: "user" | "assistant";
  content: string;
}

const messages: Message[] = [];

function appendMessage(role: "user" | "assistant", content: string) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `p-3 rounded-lg max-w-[80%] ${role === "user" ? "bg-dark-accent text-slate-900 ml-auto" : "bg-slate-700 text-slate-200 mr-auto"}`;
  msgDiv.textContent = content;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const content = userInput.value.trim();
  if (!content) return;

  userInput.value = "";
  appendMessage("user", content);
  messages.push({ role: "user", content });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        reasoning: { "enabled": true },
      }),
    });

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    appendMessage("assistant", assistantMessage);
    messages.push({ role: "assistant", content: assistantMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    appendMessage("assistant", "Sorry, something went wrong.");
  }
}

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
