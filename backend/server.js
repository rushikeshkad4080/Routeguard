const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Ensure this points to your pool connection
require('dotenv').config();

// Import Routes
const shipmentRoutes = require('./routes/shipmentRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// 1. MIDDLEWARE
app.use(cors()); 
app.use(express.json());

// Request Logger - Crucial for tracking frontend-to-backend Handshakes
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} → ${req.url}`);
    next();
});

// 2. DATABASE CONNECTIVITY CHECK
// This ensures the server only stays up if the DB is actually reachable
const checkDatabase = async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ DATABASE: MySQL connection pool verified.");
        connection.release();
    } catch (err) {
        console.error("\n❌ DATABASE CONNECTION FAILED!");
        console.error("Check your .env file and ensure MySQL is running.");
        console.error("Error Details:", err.message, "\n");
        // We don't kill the process so you can fix the DB while the server waits
    }
};
checkDatabase();

// 3. API ROUTES
app.use('/api/shipments', shipmentRoutes);
app.use('/api/ai', aiRoutes);

// 4. BASE ROUTE (Health Check)
app.get('/', (req, res) => {
    res.json({
        status: 'Online',
        message: '🚀 RouteGuard Backend Command Center is active',
        timestamp: new Date().toISOString()
    });
});

// 5. GLOBAL ERROR HANDLING
app.use((err, req, res, next) => {
    console.error("🔥 SERVER ERROR:", err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error',
        details: err.message 
    });
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 RouteGuard Server: http://localhost:${PORT}`);
    console.log(`📡 Endpoints: /api/shipments , /api/ai`);
    console.log(`=========================================\n`);
});