import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';

let db: sqlite3.Database;
const dbPath = path.join(process.cwd(), 'baitforge.db');

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error(err, 'Failed to initialize database');
        reject(err);
      } else {
        logger.info(`Database initialized at ${dbPath}`);
        resolve();
      }
    });
  });
}

export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function runAsync(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function allAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve((rows || []) as T[]);
    });
  });
}

export async function createTables(): Promise<void> {
  // Ensure storage directory exists
  await fs.mkdir(config.storage.path, { recursive: true });
  await fs.mkdir(config.audio.tempDir, { recursive: true });

  const schema = `
    CREATE TABLE IF NOT EXISTS baits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('front', 'end')),
      file_path TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      duration_seconds REAL NOT NULL,
      highest_peak_dbfs REAL NOT NULL,
      creator_user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      enabled BOOLEAN DEFAULT 1,
      checksum TEXT,
      UNIQUE(name, type)
    );

    CREATE TABLE IF NOT EXISTS user_loudness (
      user_id TEXT PRIMARY KEY,
      loudness_db INTEGER NOT NULL CHECK(loudness_db >= 0 AND loudness_db <= 18),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS processing_jobs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      front_bait_id TEXT,
      end_bait_id TEXT,
      main_audio_path TEXT,
      output_audio_path TEXT,
      loudness_db INTEGER,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      error_message TEXT,
      FOREIGN KEY(front_bait_id) REFERENCES baits(id),
      FOREIGN KEY(end_bait_id) REFERENCES baits(id)
    );

    CREATE INDEX IF NOT EXISTS idx_baits_type ON baits(type);
    CREATE INDEX IF NOT EXISTS idx_baits_enabled ON baits(enabled);
    CREATE INDEX IF NOT EXISTS idx_jobs_user ON processing_jobs(user_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status);
  `;

  const statements = schema.split(';').filter(s => s.trim());
  for (const statement of statements) {
    await runAsync(statement);
  }

  logger.info('Database schema initialized');
}

export async function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}
