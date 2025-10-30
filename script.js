// File: script.js
// This code runs in the user's browser (Frontend)

// 2. Get DOM Elements
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// 3. Form Submit Event Listener
chatForm.addEventListener('submit', async(e) => {
    e.preventDefault(); // Stop the page from reloading
    const userMessage = messageInput.value.trim();
    if (!userMessage) return; // Don't send empty messages

    // 1. Display the user's message
    addMessageToChat(userMessage, 'user');
    messageInput.value = ''; // Clear the input field

    // 2. Show a "loading" message
    const loadingMessage = addMessageToChat('AI is thinking...', 'loading');

    try {
        // 3. Get the AI response from our OWN backend (not Groq)
        const aiResponse = await fetchGroqResponse(userMessage);

        // 4. Remove the "loading" message
        chatWindow.removeChild(loadingMessage);

        // 5. Display the AI's response
        addMessageToChat(aiResponse, 'ai');

    } catch (error) {
        console.error('Error fetching response:', error);
        // Change the loading message to an error message
        loadingMessage.textContent = 'Sorry, something went wrong. Please try again.';
        loadingMessage.classList.remove('loading-message');
        loadingMessage.classList.add('ai-message');
    }
});

// 4. Function to add a message to the chat window
function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    if (sender === 'user') {
        messageElement.classList.add('user-message');
    } else if (sender === 'ai') {
        messageElement.classList.add('ai-message');
    } else if (sender === 'loading') {
        messageElement.classList.add('loading-message');
    }

    const pElement = document.createElement('p');
    pElement.textContent = message;
    messageElement.appendChild(pElement);
    chatWindow.appendChild(messageElement);
    // Scroll to the bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return messageElement;
}

// 5. Function to fetch response from OUR BACKEND
async function fetchGroqResponse(userMessage) {

    // We are calling our own server file at '/api/chat'
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // We only send the user's message
        body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
        throw new Error('Failed to get response from server');
    }

    const data = await response.json();
    return data.reply; // Get the 'reply' from our server's JSON response
}