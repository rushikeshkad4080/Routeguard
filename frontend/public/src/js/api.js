const API_BASE = "http://localhost:5000/api";

async function fetchShipments() {
    try {
        const res = await fetch(`${API_BASE}/shipments`);
        const data = await res.json();
        renderShipmentTable(data);
        updateAISelect(data);
    } catch (err) {
        console.error("Database connection failed", err);
    }
}

async function createShipment() {
    const payload = {
        id: `RG-${Math.floor(Math.random() * 900) + 100}`,
        origin: document.getElementById('ns-origin').value,
        dest: document.getElementById('ns-dest').value,
        cargo: document.getElementById('ns-cargo').value,
        weight: 500,
        priority: 'standard'
    };

    const res = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Shipment saved to MySQL!");
        fetchShipments();
        showPage('dashboard');
    }
}

async function runAIPrediction() {
    const payload = {
        shipmentId: document.getElementById('ai-shipment-select').value,
        weather: document.getElementById('ai-weather').value,
        traffic: 'High Congestion'
    };

    const out = document.getElementById('ai-output');
    out.innerHTML = "🤖 Analyzing with Gemini...";

    const res = await fetch(`${API_BASE}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    out.innerHTML = `<div class="ai-text">${data.analysis}</div>`;
}

// Initial Load
document.addEventListener('DOMContentLoaded', fetchShipments);