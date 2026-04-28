const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeRoute = async (req, res) => {
    const { shipmentId, weather, traffic } = req.body;
    
    // 1. Get shipment details from MySQL
    const [shipment] = await db.query('SELECT * FROM shipments WHERE id = ?', [shipmentId]);
    
    if (!shipment.length) return res.status(404).json({ error: "Shipment not found" });

    const s = shipment[0];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Construct the prompt for Gemini
    const prompt = `
    LOGISTICS ANALYSIS MISSION:
    Shipment ID: ${s.id}
    Current Route: ${s.origin} to ${s.destination}
    Conditions: Weather: ${weather}, Traffic: ${traffic}

    TASK: Provide a technical disruption assessment.
    1. RISK LEVEL: (Low/Medium/High/Critical)
    2. ETA IMPACT: Estimate delay in hours.
    3. REROUTING: Suggest specific alternative highways (e.g., NH48, Expressway).
    4. CARGO SAFETY: Note risks for ${s.cargo_type}.

    Format the response using Markdown with bold headers.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Parse text or return as is
        res.json({ analysis: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Gemini AI failed to process request" });
    }
};