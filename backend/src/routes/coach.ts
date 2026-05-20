import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateCoachMessage } from '../services/claude';

const router = Router();

router.post('/generate', authenticate, async (req: AuthRequest, res: Response) => {
  const { message_type = 'nudge' } = req.body;
  const userId = req.user!.id;

  try {
    const [userResult, weekStats] = await Promise.all([
      pool.query('SELECT display_name, current_xp, current_level, current_streak, longest_streak FROM users WHERE id = $1', [userId]),
      pool.query(
        `SELECT
          COALESCE(SUM(total_spent), 0) as total_spent,
          COALESCE(SUM(total_resisted), 0) as total_resisted,
          COUNT(*) FILTER (WHERE is_no_spend_day = true) as no_spend_days
         FROM daily_log WHERE user_id = $1 AND log_date >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
    ]);

    const stats = {
      user: userResult.rows[0],
      week: weekStats.rows[0],
      message_type,
    };

    const content = await generateCoachMessage(message_type, stats);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO coach_messages (id, user_id, message_type, content) VALUES ($1, $2, $3, $4)',
      [id, userId, message_type, content]
    );

    res.json({ id, content, message_type });
  } catch (err) {
    console.error('Coach generate error:', err);
    res.status(500).json({ error: 'Failed to generate coach message' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM coach_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [req.user!.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('UPDATE coach_messages SET read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
