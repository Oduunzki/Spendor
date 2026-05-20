import { Pool } from 'pg';

export function calcXpForResisted(amount: number): number {
  return Math.max(1, Math.floor(amount / 10));
}

export function calcXpForNoSpendDay(): number {
  return 50;
}

export function calcXpForStreakBonus(streakLength: number): number {
  return streakLength * 10;
}

export function calcXpForWaitingListSkipped(amount: number): number {
  return Math.max(1, Math.floor(amount / 5));
}

export function calcXpForReceiptLogged(): number {
  return 5;
}

export function calcLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

export async function awardXp(
  userId: string,
  xpAmount: number,
  pool: Pool
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const result = await pool.query(
    'UPDATE users SET current_xp = current_xp + $1 WHERE id = $2 RETURNING current_xp, current_level',
    [xpAmount, userId]
  );
  const { current_xp } = result.rows[0];
  const newLevel = calcLevel(current_xp);
  const leveledUp = newLevel > result.rows[0].current_level;
  if (leveledUp) {
    await pool.query('UPDATE users SET current_level = $1 WHERE id = $2', [newLevel, userId]);
  }
  return { newXp: current_xp, newLevel, leveledUp };
}

export async function updateStreak(
  userId: string,
  pool: Pool
): Promise<{ streak: number; isNewDay: boolean }> {
  const userResult = await pool.query(
    'SELECT current_streak, longest_streak, last_active_date FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.last_active_date ? user.last_active_date.toISOString().split('T')[0] : null;

  if (lastActive === today) {
    return { streak: user.current_streak, isNewDay: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastActive === yesterdayStr) {
    newStreak = user.current_streak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, user.longest_streak || 0);
  await pool.query(
    'UPDATE users SET current_streak = $1, longest_streak = $2, last_active_date = $3 WHERE id = $4',
    [newStreak, newLongest, today, userId]
  );

  return { streak: newStreak, isNewDay: true };
}
