const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const LOG_FILE = path.join(__dirname, 'attempts.log');

function logAttempt(userPrompt) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const logEntry = `${dateStr} ${timeStr} | ${userPrompt}\n`;
    fs.appendFile(LOG_FILE, logEntry, (err) => {
        if (err) console.error('Failed to log attempt:', err);
    });
}

// Example route for checking an answer (modify as needed)
app.post('/check-answer', (req, res) => {
    const { answer, questionIndex } = req.body;
    logAttempt(answer); // Log the user prompt (answer)

    // ... your existing answer checking logic ...
    // For demonstration:
    const isCorrect = answer.trim().toLowerCase() === 'your_expected_answer'; // Replace logic as needed

    res.json({ correct: isCorrect });
});

// ... your other routes ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});