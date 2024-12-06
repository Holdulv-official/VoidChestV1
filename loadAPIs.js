const fs = require('fs');
const path = require('path');

function loadAPIs() {
    const filePath = path.join(__dirname, 'APIs.VC'); 
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading APIs.VC:', err);
        return [];
    }
}

module.exports = loadAPIs;
