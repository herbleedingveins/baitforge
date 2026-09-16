import { v4 as uuidv4 } from 'crypto';
import { runAsync, getAsync, allAsync } from './database';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export interface Bait {
  id: string;
  name: string;
  type: 'front' | 'end';
  filePath: string;
  originalFilename: string;
  fileSizeBytes: number;
  durationSeconds: number;
  highestPeakDbfs: number;
  creatorUserId: string;
  createdAt: string;
  enabled: boolean;
  checksum?: string;
}

export async function createBait(bait: Omit<Bait, 'id' | 'createdAt'>): Promise<Bait> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  await runAsync(
    `INSERT INTO baits (
      id, name, type, file_path, original_filename, file_size_bytes,
      duration_seconds, highest_peak_dbfs, creator_user_id, created_at, enabled, checksum
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      bait.name,
      bait.type,
      bait.filePath,
      bait.originalFilename,
      bait.fileSizeBytes,
      bait.durationSeconds,
      bait.highestPeakDbfs,
      bait.creatorUserId,
      createdAt,
      bait.enabled ? 1 : 0,
      bait.checksum || null,
    ]
  );

  logger.info({ id, name: bait.name, type: bait.type }, 'Bait created');

  return {
    ...bait,
    id,
    createdAt,
  };
}

export async function getBaitById(id: string): Promise<Bait | null> {
  const row = await getAsync<any>('SELECT * FROM baits WHERE id = ?', [id]);
  if (!row) return null;
  return mapRowToBait(row);
}

export async function getBaitByName(name: string, type: 'front' | 'end'): Promise<Bait | null> {
  const row = await getAsync<any>('SELECT * FROM baits WHERE name = ? AND type = ?', [
    name,
    type,
  ]);
  if (!row) return null;
  return mapRowToBait(row);
}

export async function getAllBaitsOfType(type: 'front' | 'end'): Promise<Bait[]> {
  const rows = await allAsync<any>(
    'SELECT * FROM baits WHERE type = ? AND enabled = 1 ORDER BY created_at ASC',
    [type]
  );
  return rows.map(mapRowToBait);
}

export async function updateBait(id: string, updates: Partial<Omit<Bait, 'id' | 'createdAt'>>): Promise<void> {
  const setClauses = [];
  const values = [];

  if ('name' in updates) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }
  if ('enabled' in updates) {
    setClauses.push('enabled = ?');
    values.push(updates.enabled ? 1 : 0);
  }
  if ('highestPeakDbfs' in updates) {
    setClauses.push('highest_peak_dbfs = ?');
    values.push(updates.highestPeakDbfs);
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await runAsync(`UPDATE baits SET ${setClauses.join(', ')} WHERE id = ?`, values);
  logger.info({ id }, 'Bait updated');
}

export async function deleteBait(id: string): Promise<void> {
  await runAsync('DELETE FROM baits WHERE id = ?', [id]);
  logger.info({ id }, 'Bait deleted');
}

export async function checkDuplicateByChecksum(checksum: string): Promise<Bait | null> {
  const row = await getAsync<any>('SELECT * FROM baits WHERE checksum = ?', [checksum]);
  return row ? mapRowToBait(row) : null;
}

function mapRowToBait(row: any): Bait {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    filePath: row.file_path,
    originalFilename: row.original_filename,
    fileSizeBytes: row.file_size_bytes,
    durationSeconds: row.duration_seconds,
    highestPeakDbfs: row.highest_peak_dbfs,
    creatorUserId: row.creator_user_id,
    createdAt: row.created_at,
    enabled: Boolean(row.enabled),
    checksum: row.checksum,
  };
}
