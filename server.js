const express = require('express');
const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, 'enigmes.csv');
const logFilePath = path.join(__dirname, 'attempts.log');

const app = express();
app.use(express.json());

// Parse CSV and keep in memory for quick lookup
let enigmes = [];
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (!err) {
    enigmes = data.trim().split('\n').map((line, idx) => {
      const comma = line.indexOf(',');
      if (comma === -1) return [null, null];
      let key = line.substring(0, comma).trim();
      // Remove BOM just in case
      if (idx === 0 && key.charCodeAt(0) === 0xFEFF) {
        key = key.slice(1);
      }
      const value = line.substring(comma + 1).trim();
      return [key, value];
    }).filter(([key, value]) => key && value);
  } else {
    console.error('Could not read enigmes.csv:', err);
  }
});

// Function to log attempts
function logAttempt(userInput, result) {
  const now = new Date().toISOString();
  fs.appendFile(
    logFilePath,
    `${now} | ${userInput} | ${result}\n`,
    err => {
      if (err) console.error('Could not write to log file:', err);
    }
  );
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to check answer
app.post('/check', (req, res) => {
  const userInput = (req.body.answer || '').trim();
  const entry = enigmes.find(([key]) => key === userInput);
  if (entry) {
    logAttempt(userInput, entry[1]);
    res.json({ valid: true, message: entry[1] });
  } else {
    logAttempt(userInput, "incorrect");
    res.json({ valid: false, message: "Indice incorrect, esssayez encore" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));