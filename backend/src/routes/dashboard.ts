import { Router, Response } from 'express';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { xpForNextLevel } from '../services/xp';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  try {
    const [userResult, monthStats, recentReceipts, recentResisted, waitingActive, latestCoach] = await Promise.all([
      pool.query('SELECT id, email, display_name, current_xp, current_level, current_streak, longest_streak FROM users WHERE id = $1', [userId]),
      pool.query(
        `SELECT
          COALESCE(SUM(total_spent), 0) as total_spent,
          COALESCE(SUM(total_resisted), 0) as total_resisted,
          COUNT(*) FILTER (WHERE is_no_spend_day = true) as no_spend_days,
          COALESCE(SUM(xp_earned), 0) as xp_earned
         FROM daily_log WHERE user_id = $1 AND log_date >= $2`,
        [userId, monthStart]
      ),
      pool.query('SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]),
      pool.query('SELECT * FROM resisted_purchases WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [userId]),
      pool.query("SELECT * FROM waiting_list WHERE user_id = $1 AND (outcome IS NULL OR outcome = 'still_waiting') ORDER BY added_at DESC", [userId]),
      pool.query('SELECT * FROM coach_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]),
    ]);

    const user = userResult.rows[0];
    const nextLevel = user.current_level + 1;
    const xpForNext = xpForNextLevel(nextLevel);
    const xpForCurrent = xpForNextLevel(user.current_level);

    res.json({
      user,
      month: monthStats.rows[0],
      recent_receipts: recentReceipts.rows,
      recent_resisted: recentResisted.rows,
      waiting_list_active: waitingActive.rows,
      latest_coach_message: latestCoach.rows[0] || null,
      xp_to_next_level: xpForNext,
      xp_current_level_base: xpForCurrent,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
