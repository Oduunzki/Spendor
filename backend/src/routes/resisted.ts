import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { awardXp, calcXpForResisted, updateStreak } from '../services/xp';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { description, estimated_amount, category, reason } = req.body;
  const userId = req.user!.id;

  if (!description || !estimated_amount) {
    res.status(400).json({ error: 'Description and amount required' });
    return;
  }

  try {
    const xpEarned = calcXpForResisted(parseFloat(estimated_amount));
    const id = uuidv4();

    await pool.query(
      'INSERT INTO resisted_purchases (id, user_id, description, estimated_amount, category, reason, xp_earned) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, description, estimated_amount, category, reason, xpEarned]
    );

    const today = new Date().toISOString().split('T')[0];
    await pool.query(
      `INSERT INTO daily_log (id, user_id, log_date, total_resisted, xp_earned)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, log_date) DO UPDATE
       SET total_resisted = daily_log.total_resisted + $4, xp_earned = daily_log.xp_earned + $5`,
      [uuidv4(), userId, today, estimated_amount, xpEarned]
    );

    await updateStreak(userId, pool);
    const xpResult = await awardXp(userId, xpEarned, pool);

    res.status(201).json({ id, xp_earned: xpEarned, ...xpResult });
  } catch (err) {
    console.error('Resisted purchase error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  try {
    const result = await pool.query(
      'SELECT * FROM resisted_purchases WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user!.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
