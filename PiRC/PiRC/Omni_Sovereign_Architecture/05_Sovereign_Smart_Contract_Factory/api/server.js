/**
 * PiRC Sovereign API Gateway
 * Endpoint: POST /api/v1/tokenize
 */

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { handleLuxamirScan } from '../integration/luxamir_verify_bridge.js';

const app = express();
const PORT = process.env.PORT || 3000;

const sanitizeForLog = (value) => String(value ?? '').replace(/[\r\n]/g, '');

app.use(cors());
app.use(bodyParser.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: "Online", system: "PiRC Sovereign Factory" });
});

/**
 * Main Tokenization Endpoint
 * Receives data from Luxamir AR Scan
 */
app.post('/api/v1/tokenize', async (req, res) => {
    const scanData = req.body;
    const sanitizedProductIdForLog = sanitizeForLog(scanData.id);

    console.log(`[API] Received tokenization request for Product: ${sanitizedProductIdForLog}`);

    if (!scanData.id || !scanData.owner) {
        return res.status(400).json({ error: "Missing Product ID or Owner Address" });
    }

    try {
        // Trigger the Integration Bridge
        const certificate = await handleLuxamirScan(scanData);
        
        res.status(201).json({
            message: "Sovereign Asset Created Successfully",
            certificate: certificate
        });
    } catch (error) {
        console.error("[API ERROR]", error.message);
        res.status(500).json({ error: "Internal Tokenization Failure" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 PiRC Sovereign API running on http://localhost:${PORT}`);
    console.log(`🔗 Endpoint Ready: POST /api/v1/tokenize`);
});
