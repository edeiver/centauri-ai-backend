const pool = require('../db');

const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const findUserById = async (userId) => {
    const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [userId]
    );

    return result.rows[0];
};

exports.getMe = async (req, res) => {
    try {
        const user = await findUserById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUser = async (req, res) => {
    const { userId } = req.params;

    if (!uuidRegex.test(userId)) {
        return res.status(400).json({ error: 'User ID must be a valid UUID' });
    }

    if (req.userId !== userId) {
        return res.status(403).json({ error: 'Cannot access another user profile' });
    }

    try {
        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
