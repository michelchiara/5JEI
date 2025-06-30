const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'enigmes.csv');
const LOG_FILE = path.join(__dirname, 'attempts.log');

app.use(express.json());
app.use(express.static('public'));

// Load reference data into memory at startup
let reference = [];
function loadReference() {
    reference = [];
    if (fs.existsSync(DATA_FILE)) {
        const lines = fs.readFileSync(DATA_FILE, 'utf8').split('\n');
        for (const line of lines) {
            if (!line.trim()) continue;
            const [col1, col2] = line.split(',');
            if (col1 !== undefined && col2 !== undefined) {
                reference.push([col1.trim(), col2.trim()]);
            }
        }
    }
}
loadReference();

// Log attempts
function logAttempt(proposition, result) {
    const now = new Date();
    const entry = `${now.toISOString()} | ${proposition} | ${result}\n`;
    fs.appendFile(LOG_FILE, entry, err => { /* ignore errors */ });
}

app.post('/check-answer', (req, res) => {
    const proposition = (req.body.proposition || '').trim();
    let found = false;
    let result = '';
    for (const [col1, col2] of reference) {
        if (proposition === col1) {
            found = true;
            result = col2;
            break;
        }
    }
    logAttempt(proposition, found ? result : "incorrect");
    res.json(found ? { found: true, result } : { found: false });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});