const pool = require('../db');

exports.getInsights = async (req, res) => {
    try {
        if (!process.env.OPENAI_KEY) {
            return res.status(500).json({ error: 'AI service is not configured' });
        }

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
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
                model: 'gpt-4.1',
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI request failed with status ${response.status}`);
        }

        const data = await response.json();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
