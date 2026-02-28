// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Secure Firebase Connection
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  }),
  // Updated to your new dentallab-erp database URL!
  databaseURL: "https://dentallab-erp-default-rtdb.asia-southeast1.firebasedatabase.app" 
});

const db = admin.database();

// --- SECURE LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const apiKey = process.env.FIREBASE_API_KEY; // Pulls from your .env vault!

    try {
        // The server securely checks the password with Google Identity Toolkit
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        
        const data = await response.json();

        if (data.error) {
            return res.status(401).json({ error: data.error.message });
        }

        // Send a success ticket back to the browser
        res.json({ token: data.idToken, email: data.email });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login." });
    }
});

// --- SECURE DATA ROUTE FOR DASHBOARD ---
app.get('/api/sales', async (req, res) => {
    try {
        const snapshot = await db.ref('sales').once('value');
        const salesData = snapshot.val() || {};
        
        const jobsArray = Object.keys(salesData).map(key => ({
            id: key,
            ...salesData[key]
        }));

        res.json(jobsArray);
    } catch (error) {
        console.error("Error fetching sales:", error);
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

// Start the engine
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Secure App running on http://localhost:${PORT}`);
});