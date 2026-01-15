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

function appendMessage(role: "user" | "assistant", content: string, reasoning?: string) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `p-4 rounded-2xl w-fit max-w-[85%] shadow-sm ${role === "user" ? "bg-dark-accent text-slate-900 ml-auto rounded-tr-none" : "bg-slate-700/50 text-slate-200 mr-auto rounded-tl-none border border-slate-600/50"}`;

  if (role === "assistant" && reasoning) {
    const reasoningDiv = document.createElement("div");
    reasoningDiv.className = "mb-3 pb-3 border-b border-slate-600/50 text-sm italic text-slate-400";
    reasoningDiv.innerHTML = `<span class="block font-semibold not-italic text-xs uppercase tracking-wider mb-1 text-slate-500">Thought Process</span>${reasoning}`;
    msgDiv.appendChild(reasoningDiv);
  }

  const contentDiv = document.createElement("div");
  contentDiv.className = "leading-relaxed";
  contentDiv.textContent = content;
  msgDiv.appendChild(contentDiv);

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
        include_reasoning: true,
      }),
    });

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    const reasoning = data.choices[0].message.reasoning;

    appendMessage("assistant", assistantMessage, reasoning);
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
