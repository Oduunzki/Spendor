import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { parseReceiptImage } from '../services/claude';
import { awardXp, calcXpForReceiptLogged, updateStreak } from '../services/xp';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/scan', authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    let base64Image: string;
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';

    if (req.file) {
      base64Image = req.file.buffer.toString('base64');
      mediaType = (req.file.mimetype as typeof mediaType) || 'image/jpeg';
    } else if (req.body.imageBase64) {
      base64Image = req.body.imageBase64;
      mediaType = req.body.mediaType || 'image/jpeg';
    } else {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const result = await parseReceiptImage(base64Image, mediaType);
    res.json(result);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Failed to parse receipt' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { store_name, total_amount, currency, receipt_date, was_planned, items, raw_ai_response } = req.body;
  const userId = req.user!.id;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const receiptId = uuidv4();
      await client.query(
        `INSERT INTO receipts (id, user_id, store_name, total_amount, currency, receipt_date, was_planned, raw_ai_response)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [receiptId, userId, store_name, total_amount, currency || 'NOK', receipt_date, was_planned, raw_ai_response ? JSON.stringify(raw_ai_response) : null]
      );

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await client.query(
            'INSERT INTO receipt_items (id, receipt_id, description, amount, category, quantity) VALUES ($1, $2, $3, $4, $5, $6)',
            [uuidv4(), receiptId, item.description, item.amount, item.category, item.quantity || 1]
          );
        }
      }

      // Update daily log
      const today = new Date().toISOString().split('T')[0];
      await client.query(
        `INSERT INTO daily_log (id, user_id, log_date, total_spent, xp_earned)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, log_date) DO UPDATE
         SET total_spent = daily_log.total_spent + $4, xp_earned = daily_log.xp_earned + $5`,
        [uuidv4(), userId, today, total_amount || 0, calcXpForReceiptLogged()]
      );

      await client.query('COMMIT');

      await updateStreak(userId, pool);
      const xpResult = await awardXp(userId, calcXpForReceiptLogged(), pool);

      res.status(201).json({ id: receiptId, xp_earned: calcXpForReceiptLogged(), ...xpResult });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Save receipt error:', err);
    res.status(500).json({ error: 'Failed to save receipt' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  try {
    const result = await pool.query(
      'SELECT * FROM receipts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user!.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const receipt = await pool.query('SELECT * FROM receipts WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    if (!receipt.rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    const items = await pool.query('SELECT * FROM receipt_items WHERE receipt_id = $1', [req.params.id]);
    res.json({ ...receipt.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
