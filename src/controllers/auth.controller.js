const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const existing = await pool.query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Username already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, hashed, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query(
            'UPDATE users SET refresh_token = $1 WHERE id = $2',
            [refreshToken, user.id]
        );

        res.json({
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        let payload;

        try {
            payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [payload.userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        if (user.refresh_token !== refreshToken) {
            return res.status(403).json({ error: 'Refresh token does not match' });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            let payload = null;

            try {
                payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            } catch (err) { }

            if (payload?.userId) {
                await pool.query(
                    'UPDATE users SET refresh_token = NULL WHERE id = $1',
                    [payload.userId]
                );
            }
        }

        res.json({ message: 'Logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};