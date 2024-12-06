// Function to fetch the API configuration from the 'API.VC' file
async function loadApiConfig() {
    try {
        const response = await fetch('API.VC');  // Assuming the file is in the public directory
        const apiConfig = await response.json();
        return apiConfig;
    } catch (error) {
        console.error('Error loading API configuration:', error);
        return [];
    }
}

// Function to start the conversation
document.getElementById('startConversationBtn').addEventListener('click', async () => {
    // Get the user's input values
    const selectedApi = document.getElementById('aiApi').value;  // Selected API
    const apiKey = document.getElementById('apiKey').value;  // API key entered by the user
    const userMessage = document.getElementById('userMessage').value;  // User's message
    
    if (!selectedApi || !apiKey || !userMessage) {
        alert("Please fill in all fields.");
        return;
    }

    // Load API configuration
    const apiConfig = await loadApiConfig();
    const selectedApiConfig = apiConfig.find(api => api.name === selectedApi);

    if (!selectedApiConfig) {
        alert("Selected API not found.");
        return;
    }

    // Update request body with the user's message
    let requestBody = { ...selectedApiConfig.requestBody };

    // Replace the placeholder with the user's message
    if (selectedApiConfig.name === "OpenAI" || selectedApiConfig.name === "AI21") {
        requestBody.messages.forEach(msg => {
            if (msg.content) {
                msg.content = msg.content.replace("{{message}}", userMessage);
            }
            if (msg.text) {
                msg.text = msg.text.replace("{{message}}", userMessage);
            }
        });
    } else if (selectedApiConfig.name === "Anthropic Claude") {
        requestBody.prompt = requestBody.prompt.replace("{{message}}", userMessage);
    }

    // Make the API request
    try {
        const response = await fetch(selectedApiConfig.endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        // Parse and display the API response
        const data = await response.json();

        if (response.ok) {
            document.getElementById('response').innerText = `Response: ${JSON.stringify(data, null, 2)}`;
        } else {
            document.getElementById('response').innerText = `Error: ${data.error.message || "Something went wrong"}`;
        }

    } catch (error) {
        document.getElementById('response').innerText = `Error: ${error.message}`;
    }
});

// Dynamically populate the select dropdown
async function populateApiSelect() {
    const apiConfig = await loadApiConfig();
    const aiApiSelect = document.getElementById('aiApi');
    
    apiConfig.forEach(api => {
        const option = document.createElement('option');
        option.value = api.name;
        option.textContent = api.name;
        aiApiSelect.appendChild(option);
    });
}

// Populate the API select options when the page loads
populateApiSelect();
