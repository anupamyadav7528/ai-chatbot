// script.js (Updated Version)

// --- 1. DOM Elements (Aapke Puraane Elements) ---
const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

// --- (NEW) Naya Subject Mode Element ---
const subjectMode = document.querySelector("#subject-mode");

let userApiKey = localStorage.getItem("api-key");
let userText = null;

// --- (NEW) Chat History Array ---
// Yeh array saari chat ko memory mein rakhega
let chatHistory = [];

// --- (NEW) System Prompts for Subject Modes ---
const SYSTEM_PROMPTS = {
    'general': 'You are a helpful and encouraging study assistant. Answer questions clearly and concisely.',
    'math': 'You are a specialized math tutor. Explain concepts step-by-step and use LaTeX for equations.',
    'physics': 'You are a specialized physics tutor. Focus on formulas, principles, and real-world examples.',
    'history': 'You are a specialized history tutor. Provide detailed historical context, dates, and key figures.',
    'code': 'You are an expert code helper. Provide clean, well-commented code snippets and explain programming concepts.'
};

// --- 2. Load Data from Local Storage (MODIFIED) ---
const loadDataFromLocalStorage = () => {
    // Load Theme
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    // Load API Key
    userApiKey = localStorage.getItem("api-key");
    if (!userApiKey) {
        chatInput.value = "PASTE YOUR API KEY HERE";
        chatInput.classList.add("api-key-needed");
    } else {
        chatInput.classList.remove("api-key-needed");
    }

    // --- (NEW) Load Chat History ---
    const savedHistory = localStorage.getItem("all-chats");
    if (savedHistory) {
        // Agar history hai, toh use array mein daalo
        chatHistory = JSON.parse(savedHistory);

        // Aur har message ko screen par (re-render) dikhao
        chatHistory.forEach(message => {
            const type = (message.role === 'user') ? 'outgoing' : 'incoming';
            createChatLi(message.content, type);
        });
        chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom
    } else {
        // Agar koi history nahi hai, toh default message dikhao
        createChatLi("Hi! Select a study mode and ask me anything.", "incoming");
    }
}

// --- 3. Create Chat <li> (Aapka Puraana Function - No Change) ---
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ?
        `<p>${message}</p>` :
        `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    chatContainer.appendChild(chatLi);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return chatLi;
}

// --- (NEW) Function to save history to Local Storage ---
const saveChatHistory = () => {
    localStorage.setItem("all-chats", JSON.stringify(chatHistory));
}

// --- 4. Get Chat Response (HEAVILY MODIFIED) ---
const getChatResponse = async() => {
    if (!userApiKey) {
        createChatLi("Error: API Key not found. Please paste your API key in the input.", "incoming");
        return;
    }

    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    // Naya message (typing...) wala create karo
    const incomingChatDiv = createChatLi("Typing...", "incoming");

    // --- (NEW) Prepare messages for API ---
    // 1. Get the current subject mode
    const selectedSubject = subjectMode.value;

    // 2. Create the system prompt
    const systemMessage = {
        role: "system",
        content: SYSTEM_PROMPTS[selectedSubject] || SYSTEM_PROMPTS['general']
    };

    // 3. Build the final message list (System prompt + all chat history)
    const messagesForAPI = [
        systemMessage,
        ...chatHistory // Saari puraani chat
    ];

    // --- API Request Options (MODIFIED) ---
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userApiKey}`
        },
        body: JSON.stringify({
            messages: messagesForAPI, // Yahan 'chatHistory' array bhej rahe hain
            model: "llama3-8b-8192" // Aap model change kar sakte hain
        })
    };

    // --- API Call and Response Handling ---
    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // --- (NEW) Save AI response to history ---
        chatHistory.push({ role: "assistant", content: aiResponse });

        // Update the "Typing..." message with the real response
        incomingChatDiv.querySelector("p").textContent = aiResponse;

        // --- (NEW) Save the updated history to local storage ---
        saveChatHistory();

    } catch (error) {
        console.error("API Error:", error);
        incomingChatDiv.querySelector("p").textContent = "Oops! Something went wrong. Please check your API key or try again. Error: " + error.message;
        incomingChatDiv.classList.add("error");
    } finally {
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }
}

// --- 5. Handle Outgoing Chat (MODIFIED) ---
const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    // Check if API key is being set
    if (userText === "PASTE YOUR API KEY HERE" || userText.startsWith("sk-")) {
        userApiKey = userText;
        localStorage.setItem("api-key", userApiKey);
        chatInput.value = "";
        chatInput.classList.remove("api-key-needed");
        createChatLi("API Key set successfully!", "incoming");
        return;
    }

    // Clear input field
    chatInput.value = "";

    // Show user's message on screen
    createChatLi(userText, "outgoing");

    // --- (NEW) Save user's message to history array ---
    chatHistory.push({ role: "user", content: userText });

    // Call API (ab yeh history array ka istemaal karega)
    setTimeout(getChatResponse, 500);
}

// --- 6. Delete Button (MODIFIED) ---
deleteButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all chats?")) {
        // Clear from local storage
        localStorage.removeItem("all-chats");

        // --- (NEW) Clear the history array from memory ---
        chatHistory = [];

        // Clear the UI (screen)
        chatContainer.innerHTML = "";

        // Show the default welcome message again
        createChatLi("Chat cleared! How can I help you today?", "incoming");
    }
});

// --- 7. Theme Button (Aapka Puraana Code - No Change) ---
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", document.body.classList.contains("light-mode") ? "light_mode" : "dark_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// --- 8. Event Listeners (Aapka Puraana Code - No Change) ---
sendButton.addEventListener("click", handleOutgoingChat);
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// --- 9. Load data on page load ---
loadDataFromLocalStorage();