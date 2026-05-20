import { Router, Response } from 'express';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, current_xp, current_level, current_streak, longest_streak, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { display_name } = req.body;
  try {
    await pool.query('UPDATE users SET display_name = $1 WHERE id = $2', [display_name, req.user!.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/insights', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [categorySpending, resistedByReason, weeklyTrend, waitingStats] = await Promise.all([
      pool.query(
        `SELECT ri.category, SUM(ri.amount) as total
         FROM receipt_items ri
         JOIN receipts r ON r.id = ri.receipt_id
         WHERE r.user_id = $1 AND r.created_at >= $2
         GROUP BY ri.category ORDER BY total DESC`,
        [userId, thirtyDaysAgo]
      ),
      pool.query(
        `SELECT reason, COUNT(*) as count, SUM(estimated_amount) as total_amount
         FROM resisted_purchases WHERE user_id = $1 AND created_at >= $2
         GROUP BY reason`,
        [userId, thirtyDaysAgo]
      ),
      pool.query(
        `SELECT DATE_TRUNC('week', log_date) as week, SUM(total_resisted) as resisted, SUM(total_spent) as spent
         FROM daily_log WHERE user_id = $1 AND log_date >= $2
         GROUP BY week ORDER BY week`,
        [userId, thirtyDaysAgo]
      ),
      pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE outcome = 'skipped') as dropped,
          COUNT(*) as total,
          COALESCE(SUM(estimated_amount) FILTER (WHERE outcome = 'skipped'), 0) as amount_saved
         FROM waiting_list WHERE user_id = $1`,
        [userId]
      ),
    ]);

    res.json({
      category_spending: categorySpending.rows,
      resisted_by_reason: resistedByReason.rows,
      weekly_trend: weeklyTrend.rows,
      waiting_stats: waitingStats.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
