const OPENROUTER_API_KEY = "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";

let messages = []; // Array to store chat history

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Add user message to history
    messages.push({
        role: 'user',
        content: userMessage
    });

    // Display user message
    displayMessage('user', userMessage);

    // Clear input
    userInput.value = '';

    // Make API call
    fetchResponse();
}

async function fetchResponse() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-20b:free",
                "messages": messages,
                "reasoning": {"enabled": true}
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                displayMessage('assistant', 'Rate limit exceeded. Please wait a moment before sending another message.');
            } else {
                displayMessage('assistant', `Error: ${response.status} ${response.statusText}`);
            }
            return;
        }

        const data = await response.json();
        if (!data.choices || data.choices.length === 0) {
            displayMessage('assistant', 'No response received from the AI. Please try again.');
            return;
        }

        const assistantMessage = data.choices[0].message;
        const content = assistantMessage.content || 'No content in response.';
        const reasoning = assistantMessage.reasoning_details || null;

        // Add assistant message to history
        messages.push({
            role: 'assistant',
            content: content,
            reasoning_details: reasoning
        });

        // Display assistant message
        displayMessage('assistant', content, reasoning);
    } catch (error) {
        console.error('Error fetching response:', error);
        displayMessage('assistant', 'Sorry, there was an error processing your request.');
    }
}

function displayMessage(role, content, reasoning = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'assistant-message');
    messageDiv.textContent = content;

    if (reasoning) {
        const reasoningDiv = document.createElement('div');
        const reasoningContent = JSON.stringify(reasoning, null, 2); // JSON Output: [{type: "", text: "", format: unknown, index: 0}] (JSON inside an array)
        reasoningDiv.classList.add('reasoning');
        // reasoningDiv.textContent = `Reasoning: ${JSON.stringify(reasoning, null, 2)}`;
        // Only show the text fields from reasoning
        reasoningDiv.textContent = `Reasoning: ${reasoning.map(r => `${r.text}`).join(' | ')}`;
        messageDiv.appendChild(reasoningDiv);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll to bottom
}
