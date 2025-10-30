// File: /api/chat.js (This is the debugging test code)

exports.handler = async function(event, context) {

        // This function will not call Groq.
        // It will just send a successful test message back.
        // This tells us if the redirect is working.

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: "Test Successful! The function is connected." })
        };
    } // File: /api/chat.js (This is the debugging test code)

exports.handler = async function(event, context) {

    // This function will not call Groq.
    // It will just send a successful test message back.
    // This tells us if the redirect is working.

    return {
        statusCode: 200,
        body: JSON.stringify({ reply: "Test Successful! The function is connected." })
    };
}