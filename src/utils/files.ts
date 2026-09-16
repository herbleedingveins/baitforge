import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';
import { logger } from './logger';

export async function ensureDirectories(): Promise<void> {
  const dirs = [
    config.storage.path,
    path.join(config.storage.path, 'front-baits'),
    path.join(config.storage.path, 'end-baits'),
    config.audio.tempDir,
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }

  logger.info('All directories ready');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export class BaitForgeError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'BaitForgeError';
  }
}
