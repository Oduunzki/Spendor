import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { awardXp, calcXpForWaitingListSkipped } from '../services/xp';

const router = Router();

function calcWaitUntil(amount: number): Date {
  const now = new Date();
  let hoursToAdd: number;
  if (amount < 200) hoursToAdd = 24;
  else if (amount < 500) hoursToAdd = 48;
  else if (amount < 1000) hoursToAdd = 72;
  else if (amount < 5000) hoursToAdd = 168;
  else hoursToAdd = 336;
  now.setHours(now.getHours() + hoursToAdd);
  return now;
}

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { description, estimated_amount, category, reason_wanted } = req.body;
  if (!description) { res.status(400).json({ error: 'Description required' }); return; }

  const waitUntil = calcWaitUntil(parseFloat(estimated_amount) || 0);
  const id = uuidv4();

  try {
    await pool.query(
      'INSERT INTO waiting_list (id, user_id, description, estimated_amount, category, reason_wanted, wait_until) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, req.user!.id, description, estimated_amount, category, reason_wanted, waitUntil]
    );
    const result = await pool.query('SELECT * FROM waiting_list WHERE id = $1', [id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM waiting_list WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/outcome', authenticate, async (req: AuthRequest, res: Response) => {
  const { outcome } = req.body;
  if (!['bought', 'skipped', 'still_waiting'].includes(outcome)) {
    res.status(400).json({ error: 'Invalid outcome' }); return;
  }

  try {
    const existing = await pool.query('SELECT * FROM waiting_list WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    if (!existing.rows.length) { res.status(404).json({ error: 'Not found' }); return; }

    await pool.query(
      'UPDATE waiting_list SET outcome = $1, decided_at = NOW() WHERE id = $2',
      [outcome, req.params.id]
    );

    let xpResult = null;
    if (outcome === 'skipped' && existing.rows[0].estimated_amount) {
      const xp = calcXpForWaitingListSkipped(parseFloat(existing.rows[0].estimated_amount));
      xpResult = await awardXp(req.user!.id, xp, pool);
      xpResult = { ...xpResult, xp_earned: xp };
    }

    res.json({ success: true, xp: xpResult });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM waiting_list WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
