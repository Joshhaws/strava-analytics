import express from 'express';
import pool from './db.js';
import { authenticateToken } from './middleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default page 1, limit 10
  const offset = (page - 1) * limit;

  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY start_date DESC LIMIT $2 OFFSET $3',
      [req.user.userId, parseInt(limit), parseInt(offset)]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});


export default router;
