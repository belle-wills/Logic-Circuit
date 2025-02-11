const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001; // Port where the backend server runs
const DATA_FILE = 'circuits.json'; // File to store saved circuit data

app.use(express.json()); // Allows backend to parse JSON requests
app.use(cors()); // Enables CORS to allow requests from frontend

// API endpoint to save a circuit
app.post('/saveCircuit', (req, res) => {
    fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            res.status(500).json({ message: 'Error saving circuit' }); // Respond with error if saving fails
        } else {
            res.json({ message: 'Circuit saved successfully' }); // Confirm circuit was saved
        }
    });
});

// API endpoint to load a saved circuit
app.get('/loadCircuit', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("❌ Error reading circuits:", err); // Log error if file read fails
            res.status(500).json({ error: "Failed to load circuits" }); // Respond with error
            return;
        }
        res.json(JSON.parse(data)); // Send saved circuit data as JSON
    });
});

// Start the backend server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`); // Confirm server is running
});
