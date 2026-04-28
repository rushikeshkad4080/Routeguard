const db = require('../config/db');
const fetch = require('node-fetch');

// Helper to get coordinates
const getCoordinates = async (cityName) => {
    try {
        // Adding ", India" ensures Ooty doesn't end up in California!
        const query = encodeURIComponent(cityName + ", India");
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`, {
            headers: { 
                'User-Agent': 'RouteGuard-Logistics-Project',
                'Referer': 'http://localhost:5000' 
            }
        });
        const data = await response.json();
        return data.length > 0 ? 
            { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : 
            { lat: 19.0760, lng: 72.8777 }; // Default Mumbai
    } catch (err) {
        return { lat: 19.0760, lng: 72.8777 };
    }
};

exports.getAllShipments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM shipments ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createShipment = async (req, res) => {
    const { id, origin, dest, cargo } = req.body;

    try {
        // INGESTION: Get coordinates for both points
        const start = await getCoordinates(origin);
        const end = await getCoordinates(dest);

        const query = `INSERT INTO shipments 
                       (id, origin, destination, cargo_type, start_lat, start_lng, end_lat, end_lng, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
        
        await db.query(query, [
            id, origin, dest, cargo, 
            start.lat, start.lng, 
            end.lat, end.lng
        ]);

        res.status(201).json({ message: "Route Data Ingested" });
    } catch (err) {
        res.status(500).json({ error: "MySQL Persistence Failure" });
    }
};