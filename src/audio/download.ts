import { Attachment } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config';
import axios from 'axios';

const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma'];

export async function validateAudioAttachment(attachment: Attachment): Promise<void> {
  // Check file size
  if (attachment.size > config.audio.maxUploadSizeMb * 1024 * 1024) {
    throw new Error(
      `File is too large. Maximum size is ${config.audio.maxUploadSizeMb} MB.`
    );
  }

  // Check file extension
  const ext = path.extname(attachment.name).toLowerCase().slice(1);
  if (!SUPPORTED_AUDIO_FORMATS.includes(ext)) {
    throw new Error(
      `Unsupported audio format. Supported: ${SUPPORTED_AUDIO_FORMATS.join(', ')}`
    );
  }

  // Check MIME type if available
  if (attachment.contentType) {
    if (!attachment.contentType.startsWith('audio/')) {
      throw new Error(`File must be an audio file, got ${attachment.contentType}`);
    }
  }
}

export async function downloadAttachment(
  attachment: Attachment,
  jobId: string
): Promise<{ filePath: string; fileName: string }> {
  await validateAudioAttachment(attachment);

  const tempDir = path.join(config.audio.tempDir, jobId);
  await fs.mkdir(tempDir, { recursive: true });

  const fileName = attachment.name;
  const filePath = path.join(tempDir, fileName);

  try {
    const response = await axios.get(attachment.url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });

    await fs.writeFile(filePath, response.data);

    // Verify file was written and has content
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    logger.info({ jobId, fileName, fileSize: stats.size }, 'Audio attachment downloaded');

    return { filePath, fileName };
  } catch (error) {
    logger.error({ jobId, error, fileName }, 'Failed to download attachment');
    throw new Error(`Failed to download audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cleanupTempDirectory(jobId: string): Promise<void> {
  const tempDir = path.join(config.audio.tempDir, jobId);
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    logger.info({ jobId }, 'Temp directory cleaned up');
  } catch (error) {
    logger.error({ jobId, error }, 'Failed to cleanup temp directory');
  }
}
