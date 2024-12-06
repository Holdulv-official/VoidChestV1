const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 6079;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());  // For handling POST data

// Function to read the API credentials from the 'APIs.VC' file
function readApiCredentials() {
    const apiFile = './APIs.VC';  // Make sure this file exists in your project root
    try {
        const apiData = fs.readFileSync(apiFile, 'utf-8');
        return JSON.parse(apiData);
    } catch (error) {
        console.error('Error reading API file:', error);
        return [];
    }
}

// Get all API credentials
app.get('/api/get-api-keys', (req, res) => {
    const apis = readApiCredentials();
    res.json(apis);
});

// Serve the API.VC file when requested by the frontend
app.get('/API.VC', (req, res) => {
    const apiFile = './APIs.VC';
    try {
        const apiData = fs.readFileSync(apiFile, 'utf-8');
        res.json(JSON.parse(apiData));
    } catch (error) {
        console.error('Error reading API.VC file:', error);
        res.status(500).json({ error: 'Error loading API configuration' });
    }
});

// Start a conversation with the selected AI API
app.post('/api/start-conversation', async (req, res) => {
    const { apiName, apiKey, userMessage } = req.body;

    // Validate if the API exists
    const api = readApiCredentials().find(api => api.name === apiName);

    if (!api) {
        return res.status(400).json({ error: 'API not found' });
    }

    // Replace the placeholder apiKey with the user-provided API key
    const selectedApi = {
        ...api,
        apiKey: apiKey,  // Use the user-provided API key
    };

    try {
        let requestBody;

        // Prepare the requestBody for the selected API
        if (selectedApi.name === "OpenAI") {
            // For OpenAI, use the request body format for chat API
            requestBody = { 
                ...selectedApi.requestBody, 
                messages: [{ role: "user", content: userMessage }] 
            };
        } else if (selectedApi.name === "AI21") {
            // For AI21, we use the provided body
            requestBody = { 
                ...selectedApi.requestBody, 
                messages: [{ text: userMessage }] 
            };
        } else if (selectedApi.name === "Anthropic Claude") {
            // Add request formatting for Anthropic Claude if needed
            requestBody = {
                prompt: userMessage,
                model: selectedApi.model || "claude-v1.3",
            };
        }

        // Make the API call using Axios
        const response = await axios.post(selectedApi.endpoint, requestBody, {
            headers: {
                'Authorization': `Bearer ${selectedApi.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Save the conversation if needed
        const filename = `conversation_${Date.now()}.txt`;
        const conversationContent = `User: ${userMessage}\nAI: ${response.data.choices[0].message.content}`;
        fs.writeFile(`./conversations/${filename}`, conversationContent, (err) => {
            if (err) console.error('Error saving conversation:', err);
        });

        // Send response to frontend
        res.json({
            message: `Conversation started with ${selectedApi.name}`,
            aiResponse: response.data.choices ? response.data.choices[0].message.content : response.data.completions[0].text
        });
    } catch (error) {
        console.error('Error communicating with AI API:', error);
        res.status(500).json({ error: 'Error communicating with AI API' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
