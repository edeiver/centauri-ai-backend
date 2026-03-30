const pool = require('../db');
const fetch = require('node-fetch');

exports.getInsights = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1',
            [req.userId]
        );

        const txs = result.rows;

        const prompt = `
Analiza estos gastos:
${JSON.stringify(txs)}

Da recomendaciones claras y cortas.
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4.1',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await response.json();

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};