const pool = require('../db');

exports.create = async (req, res) => {
    try {
        const { type, amount, category } = req.body;

        const result = await pool.query(
            `INSERT INTO transactions (type, amount, category, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [type, amount, category, req.userId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};