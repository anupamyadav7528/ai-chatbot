// File: /api/chat.js
// (This is the FINAL, REAL code for Netlify)

// This code is for Netlify's system
exports.handler = async function(event, context) {

    // 1. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 2. Get the user's message from the frontend
        const { message } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // 3. Get the secret API Key from Netlify's Environment Variables
        const GROQ_API_KEY = process.env.MY_GROQ_KEY;

        if (!GROQ_API_KEY) {
            console.error('API key is not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key is not configured on the server' })
            };
        }

        // 4. Prepare to call the real Groq API
        const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

        const requestData = {
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: 'You are a helpful study assistant. Explain complex topics clearly and concisely in English.' },
                { role: 'user', content: message }
            ],
        };

        // 5. Call the Groq API from the server
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
            return {
                statusCode: apiResponse.status,
                body: JSON.stringify({ error: 'Failed to fetch from Groq API' })
            };
        }

        // 6. Get the AI's answer
        const data = await apiResponse.json();
        const reply = data.choices[0].message.content;

        // 7. Send the real AI answer back to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ reply: reply })
        };

    } catch (error) {
        console.error('Server-side Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong on the server' })
        };
    }
};