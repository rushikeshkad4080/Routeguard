const db = require('../config/db');
const fetch = require('node-fetch');

const getCoords = async (city) => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ", India")}`, {
            headers: { 'User-Agent': 'RouteGuard-Logistics-Student-Project' }
        });
        const data = await res.json();
        return data.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : { lat: 19.07, lng: 72.87 };
    } catch (e) { return { lat: 19.07, lng: 72.87 }; }
};

const analyzeRouteWithAI = async (origin, dest, cargo) => {
    const API_KEY = process.env.GEMINI_API_KEY;
    const prompt = `Analyze a shipment of ${cargo} from ${origin} to ${dest}. Identify one realistic Indian highway disruption. Return JSON: {"risk": "Low/Medium/High", "info": "15-word news update"}`;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ""));
    } catch (e) { return { risk: "Low", info: "Route clear on major NH corridors." }; }
};

exports.createShipment = async (req, res) => {
    const { id, origin, dest, cargo } = req.body;
    
    try {
        // 1. Data Ingestion Phase
        const start = await getCoords(origin);
        const end = await getCoords(dest);
        const ai = await analyzeRouteWithAI(origin, dest, cargo);

        // 2. MySQL Persistence Phase
        const [result] = await db.query(
            `INSERT INTO shipments (id, origin, destination, cargo_type, start_lat, start_lng, end_lat, end_lng, risk_level, disruption_info) 
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [id, origin, dest, cargo, start.lat, start.lng, end.lat, end.lng, ai.risk, ai.info]
        );

        // 3. Success Response
        res.status(201).json({ 
            success: true, 
            message: `Shipment ${id} is live!`,
            data: { id, origin, dest }
        });

    } catch (err) {
        // 4. Critical Error Handling
        console.error("FATAL ERROR IN INGESTION:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Database insertion failed. See server logs.",
            error: err.message 
        });
    }
};

exports.getAllShipments = async (req, res) => {
    const [rows] = await db.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json(rows);
};