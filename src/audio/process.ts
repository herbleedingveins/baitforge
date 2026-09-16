import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';
import { inspectAudio } from './inspect';
import { config } from '../config';

export interface AudioProcessingResult {
  outputPath: string;
  durationSeconds: number;
  highestPeakDbfs: number;
  fileSizeBytes: number;
}

export async function processAudio(
  frontBaitPath: string,
  mainAudioPath: string,
  endBaitPath: string,
  loudnessDb: number,
  jobId: string
): Promise<AudioProcessingResult> {
  const tempDir = path.join(config.audio.tempDir, jobId);
  const outputPath = path.join(tempDir, 'output.mp3');

  return new Promise((resolve, reject) => {
    try {
      ffmpeg()
        .input(frontBaitPath)
        .input(mainAudioPath)
        .input(endBaitPath)
        .on('start', (cmd) => {
          logger.info({ jobId }, 'FFmpeg started');
        })
        .on('progress', (progress) => {
          logger.debug({ jobId, progress }, 'FFmpeg progress');
        })
        .on('error', (err) => {
          logger.error({ jobId, error: err }, 'FFmpeg error');
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on('end', async () => {
          try {
            logger.info({ jobId }, 'Audio processing completed');
            const stats = await fs.stat(outputPath);
            const audioInfo = await inspectAudio(outputPath);
            resolve({
              outputPath,
              durationSeconds: audioInfo.durationSeconds,
              highestPeakDbfs: audioInfo.highestPeakDbfs,
              fileSizeBytes: stats.size,
            });
          } catch (error) {
            reject(error);
          }
        })
        .audioFilter(
          `concat=n=3:v=0:a=1[a]; [a]volume=${loudnessDb}dB,alimiter=limit=1.0:release=100[a2]`,
          '[a2]'
        )
        .audioBitrate('192k')
        .audioFrequency(44100)
        .audioChannels(2)
        .toFormat('mp3')
        .save(outputPath);
    } catch (error) {
      logger.error({ jobId, error }, 'Failed to start audio processing');
      reject(error);
    }
  });
}
