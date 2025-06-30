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

// Serve static files (for index.html, etc.)
app.use(express.static(__dirname));

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));