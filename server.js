const express = require('express');
const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, 'enigmes.csv');

const app = express();
app.use(express.json());

// Parse CSV and keep in memory for quick lookup
let enigmes = [];
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (!err) {
    enigmes = data.trim().split('\n').map(line => {
      const idx = line.indexOf(',');
      return [line.substring(0, idx), line.substring(idx + 1)];
    });
  } else {
    console.error('Could not read enigmes.csv:', err);
  }
});

// API endpoint to check answer
app.post('/check', (req, res) => {
  const userInput = (req.body.answer || '').trim();
  const entry = enigmes.find(([key]) => key === userInput);
  if (entry) {
    res.json({ valid: true, message: entry[1] });
  } else {
    res.json({ valid: false, message: "Indice incorrect, esssayez encore" });
  }
});

// Serve static files (for index.html, etc.)
app.use(express.static(__dirname));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));