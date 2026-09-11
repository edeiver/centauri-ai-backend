const pool = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/auth');

const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const validateRegisterPayload = ({ username, password, email }) => {
    if (!usernameRegex.test(username || '')) {
        return 'Username must be 3-30 characters and use only letters, numbers, or underscores';
    }

    if (!emailRegex.test(email || '')) {
        return 'Email must be valid';
    }

    if (typeof password !== 'string' || password.length < 8) {
        return 'Password must be at least 8 characters';
    }

    return null;
};

const validateLoginPayload = ({ username, password }) => {
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
        return 'Username and password are required';
    }

    return null;
};

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
        const validationError = validateRegisterPayload({ username, password, email });

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, hashed, email]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const validationError = validateLoginPayload({ username, password });

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query(
            'UPDATE users SET refresh_token = $1 WHERE id = $2',
            [hashToken(refreshToken), user.id]
        );

        res.json({
            accessToken,
            refreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
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

        if (user.refresh_token !== hashToken(refreshToken)) {
            return res.status(403).json({ error: 'Refresh token does not match' });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        await pool.query(
            'UPDATE users SET refresh_token = $1 WHERE id = $2',
            [hashToken(newRefreshToken), user.id]
        );

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
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
                    'UPDATE users SET refresh_token = NULL WHERE id = $1 AND refresh_token = $2',
                    [payload.userId, hashToken(refreshToken)]
                );
            }
        }

        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.verifyToken = verifyToken;
