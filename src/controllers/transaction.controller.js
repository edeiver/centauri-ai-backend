const pool = require('../db');

const validTypes = new Set(['income', 'expense']);

const validateTransactionPayload = ({ type, amount, category }) => {
    const numericAmount = Number(amount);

    if (!validTypes.has(type)) {
        return { error: 'Type must be income or expense' };
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return { error: 'Amount must be a positive number' };
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
        return { error: 'Category is required' };
    }

    if (category.trim().length > 80) {
        return { error: 'Category must be 80 characters or fewer' };
    }

    return {
        value: {
            type,
            amount: numericAmount,
            category: category.trim()
        }
    };
};

exports.create = async (req, res) => {
    try {
        const { type, amount, category } = req.body;
        const validation = validateTransactionPayload({ type, amount, category });

        if (validation.error) {
            return res.status(400).json({ error: validation.error });
        }

        const result = await pool.query(
            `INSERT INTO transactions (type, amount, category, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [
                validation.value.type,
                validation.value.amount,
                validation.value.category,
                req.userId
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
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
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
