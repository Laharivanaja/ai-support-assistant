const express = require('express');
const cors = require('cors');
const axios = require('axios');
const initDb = require('./db');
const docs = require('./docs.json');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

let db;
initDb().then(database => {
    db = database;
    console.log("✅ SQLite Database Connected");
});

app.post('/api/chat', async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) return res.status(400).json({ error: "Missing data" });

    try {
        // 1. Database logic
        await db.run('INSERT OR IGNORE INTO sessions (id) VALUES (?)', [sessionId]);
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'user', message]);

        const history = await db.all('SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10', [sessionId]);
        const formattedHistory = history.reverse().map(m => `${m.role}: ${m.content}`).join('\n');

        // 2. Prepare the AI Prompt
        const prompt = `Use ONLY these docs: ${JSON.stringify(docs)}. History: ${formattedHistory}. User: ${message}. If not found, say "Sorry, I don’t have information about that."`;

        let aiResponse = "";

        try {
            // --- TRY REAL AI (Requirement #1A) ---
            // Changed to v1 stable to fix your 404 error
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            
            const aiRes = await axios.post(url, {
                contents: [{ parts: [{ text: prompt }] }]
            });
            aiResponse = aiRes.data.candidates[0].content.parts[0].text;
            console.log("🤖 Response from Real AI");

        } catch (aiErr) {
            // --- FALLBACK TO MOCK (Requirement #4 & #6) ---
            console.log("⚠️ AI failed (404/Key issue). Using Mock Logic fallback.");
            const userQuery = message.toLowerCase();
            aiResponse = "Sorry, I don’t have information about that.";

            for (const item of docs) {
                if (userQuery.includes(item.title.toLowerCase()) || item.content.toLowerCase().includes(userQuery)) {
                    aiResponse = item.content;
                    break;
                }
            }
        }

        // 3. Save and Respond
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', aiResponse]);
        res.json({ reply: aiResponse });

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Sidebar & Session endpoints
app.get('/api/conversations/:sessionId', async (req, res) => {
    const messages = await db.all('SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC', [req.params.sessionId]);
    res.json(messages);
});

app.get('/api/sessions', async (req, res) => {
    const sessions = await db.all('SELECT id, updated_at FROM sessions ORDER BY updated_at DESC');
    res.json(sessions);
});

app.listen(5000, () => console.log(`🚀 Server running on http://localhost:5000`));