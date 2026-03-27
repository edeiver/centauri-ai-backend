const pool = require('../db');

exports.getUser = async (req, res) => {
    const { userId } = req.params;

    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(userId)) {
        return res.status(400).json({ error: 'El ID del usuario debe ser un UUID válido' });
    }

    try {
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};