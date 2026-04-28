const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const shipmentRoutes = require('./routes/shipmentRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// 1. MIDDLEWARE
// CORS is critical - it allows your index.html file to talk to localhost:5000
app.use(cors()); 

// Allows Express to read the "body" of POST requests from your frontend
app.use(express.json());

// Request Logger (Helpful for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} request to ${req.url}`);
    next();
});

// 2. ROUTES
// All shipment logic (MySQL)
app.use('/api/shipments', shipmentRoutes);

// All AI logic (Gemini)
app.use('/api/ai', aiRoutes);

// 3. BASE ROUTE (To check if server is alive)
app.get('/', (req, res) => {
    res.send('🚀 RouteGuard Backend is running perfectly!');
});

// 4. ERROR HANDLING
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

// 5. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 RouteGuard Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`=========================================\n`);
});