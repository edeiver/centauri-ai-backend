const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashed]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user) return res.status(400).json({ error: 'User not found' });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};