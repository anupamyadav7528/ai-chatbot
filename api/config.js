// File: /api/chat.js
// This code runs on the server (Backend), not in the browser

// This 'export default' is for Vercel/Netlify
export default async function handler(request, response) {

    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Get the user's message from the frontend
    const { message } = request.body;

    if (!message) {
        return response.status(400).json({ error: 'Message is required' });
    }

    // 2. Get the secret API Key from Environment Variables
    // We will set this in the Vercel/Netlify dashboard
    const GROQ_API_KEY = process.env.MY_GROQ_KEY;

    if (!GROQ_API_KEY) {
        console.error('API key is not configured');
        return response.status(500).json({ error: 'API key is not configured on the server' });
    }

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    // 3. Prepare the request to Groq
    const requestData = {
        model: 'llama-3.1-8b-instant', // The working model
        messages: [
            { role: 'system', content: 'You are a helpful study assistant. Explain complex topics clearly and concisely in English.' },
            { role: 'user', content: message }
        ],
    };

    try {
        // 4. Call the Groq API from the server
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}` // The secret key is used here
            },
            body: JSON.stringify(requestData)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Groq API Error:', errorData);
            return response.status(apiResponse.status).json({ error: 'Failed to fetch from Groq API' });
        }

        const data = await apiResponse.json();

        // 5. Send only the AI's reply back to the frontend
        const reply = data.choices[0].message.content;
        response.status(200).json({ reply: reply });

    } catch (error) {
        console.error('Server-side Error:', error);
        response.status(500).json({ error: 'Something went wrong on the server' });
    }
}