const pool = require('../db');

exports.getInsights = async (req, res) => {
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({
                insights: [],
                recommendations: [],
                warnings: ['AI service is not configured']
            });
        }

        // 1. Revisar cache
        const userResult = await pool.query(
            'SELECT last_insights, insights_updated_at FROM users WHERE id = $1',
            [req.userId]
        );

        const user = userResult.rows[0];

        if (user?.last_insights && user?.insights_updated_at) {
            const now = new Date();
            const lastUpdate = new Date(user.insights_updated_at);

            const diffHours = (now - lastUpdate) / (1000 * 60 * 60);

            // 🔥 Si no han pasado 6 horas → devolver cache
            if (diffHours < 6) {
                return res.json(user.last_insights);
            }
        }

        // 2. Obtener transacciones
        const result = await pool.query(
            `SELECT type, amount, category 
       FROM transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
            [req.userId]
        );

        const transactions = result.rows;

        // 3. Agrupar gastos
        const summary = {};

        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const category = tx.category || 'otros';
                summary[category] = (summary[category] || 0) + Number(tx.amount);
            }
        });

        // 4. Prompt
        const prompt = `
Eres un experto financiero.

Analiza estos gastos por categoría:
${JSON.stringify(summary)}

Responde SOLO en JSON válido con esta estructura:

{
  "insights": ["string"],
  "recommendations": ["string"],
  "warnings": ["string"]
}

Reglas:
- Máximo 3 items por lista
- Frases cortas
- Nada fuera del JSON
`;

        // 5. Llamada a Claude
        const response = await fetch(
            'https://api.anthropic.com/v1/messages',
            {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                signal: AbortSignal.timeout(15000),
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Claude error body:', errorBody);
            throw new Error(`Claude request failed with status ${response.status}`);
        }

        const data = await response.json();

        let text = data?.content?.[0]?.text || '';

        // 6. Limpiar respuesta
        const cleanText = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        // 7. Parse seguro
        let parsed;

        try {
            parsed = JSON.parse(cleanText);
        } catch (err) {
            parsed = {
                insights: [],
                recommendations: [],
                warnings: ['No se pudo generar análisis']
            };
        }

        // 8. Validar estructura
        parsed.insights = Array.isArray(parsed.insights) ? parsed.insights : [];
        parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
        parsed.warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

        // 9. Guardar en DB 🔥
        await pool.query(
            `UPDATE users 
       SET last_insights = $1, insights_updated_at = NOW()
       WHERE id = $2`,
            [parsed, req.userId]
        );

        // 10. Responder
        res.json(parsed);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            insights: [],
            recommendations: [],
            warnings: ['Error interno']
        });
    }
};
