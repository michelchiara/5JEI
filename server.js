const express = require('express');
const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, 'enigmes.csv');
const logFilePath = path.join(__dirname, 'attempts.log');

const app = express();
app.use(express.json());

let enigmes = [];
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (!err) {
    enigmes = data.trim().split('\n').map((line, idx) => {
      const comma = line.indexOf(',');
      if (comma === -1) return [null, null];
      let key = line.substring(0, comma).trim();
      if (idx === 0 && key.charCodeAt(0) === 0xFEFF) {
        key = key.slice(1);
      }
      const value = line.substring(comma + 1).trim();
      return [key, value];
    }).filter(([key, value]) => key && value);
    console.log('Loaded enigmes:', enigmes.length);
  } else {
    console.error('Could not read enigmes.csv:', err);
  }
});

function logAttempt(userInput, result) {
  const now = new Date().toISOString();
  console.log('Logging attempt:', now, userInput, result);
  console.log('Attempting to write to:', logFilePath);
  fs.appendFile(
    logFilePath,
    `${now} | ${userInput} | ${result}\n`,
    err => {
      if (err) console.error('Could not write to log file:', err);
    }
  );
}

app.use(express.static(path.join(__dirname, 'public')));

// Minimal /questions endpoint so your frontend loads
app.get('/questions', (req, res) => {
  // Placeholder: You can expand this with real questions if needed!
  res.json([
    { question: "Entrez votre indice pour l'énigme." }
  ]);
});

app.post('/check', (req, res) => {
  const userInput = (req.body.answer || '').trim();
  const entry = enigmes.find(([key]) => key === userInput);
  if (entry) {
    logAttempt(userInput, entry[1]);
    res.json({ correct: true, message: entry[1] });
  } else {
    logAttempt(userInput, "incorrect");
    res.json({ correct: false, message: "Indice incorrect, essayez encore" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));