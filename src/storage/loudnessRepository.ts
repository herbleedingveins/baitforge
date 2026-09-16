import { runAsync, getAsync } from './database';
import { logger } from '../utils/logger';
import { config } from '../config';

export async function getUserLoudness(userId: string): Promise<number> {
  const row = await getAsync<{ loudness_db: number }>(
    'SELECT loudness_db FROM user_loudness WHERE user_id = ?',
    [userId]
  );
  return row?.loudness_db ?? config.audio.defaultLoudnessDb;
}

export async function setUserLoudness(userId: string, loudnessDb: number): Promise<void> {
  if (loudnessDb < 0 || loudnessDb > config.audio.maxLoudnessDb) {
    throw new Error(
      `Loudness must be between 0 and ${config.audio.maxLoudnessDb} dB, got ${loudnessDb}`
    );
  }

  // Upsert pattern
  await runAsync(
    `INSERT INTO user_loudness (user_id, loudness_db, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id) DO UPDATE SET loudness_db = ?, updated_at = CURRENT_TIMESTAMP`,
    [userId, loudnessDb, loudnessDb]
  );

  logger.info({ userId, loudnessDb }, 'User loudness setting updated');
}

export async function clearUserLoudness(userId: string): Promise<void> {
  await runAsync('DELETE FROM user_loudness WHERE user_id = ?', [userId]);
  logger.info({ userId }, 'User loudness setting cleared');
}
