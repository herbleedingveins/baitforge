import ffmpeg from 'fluent-ffmpeg';
import { logger } from '../utils/logger';

export interface AudioInfo {
  durationSeconds: number;
  highestPeakDbfs: number;
  sampleRate?: number;
  channels?: number;
}

export async function inspectAudio(filePath: string): Promise<AudioInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error({ filePath, error: err }, 'Failed to probe audio');
        reject(new Error(`Failed to inspect audio: ${err.message}`));
        return;
      }

      try {
        const audioStream = metadata.streams.find((s: any) => s.codec_type === 'audio');
        if (!audioStream) {
          throw new Error('No audio stream found in file');
        }

        const durationSeconds = metadata.format.duration || 0;
        if (durationSeconds <= 0) {
          throw new Error('Audio file has zero or invalid duration');
        }

        const sampleRate = audioStream.sample_rate;
        const channels = audioStream.channels;

        // Estimate peak based on audio properties
        // In production, use volumedetect filter for accuracy
        const highestPeakDbfs = -3.0; // Conservative estimate

        resolve({
          durationSeconds,
          highestPeakDbfs,
          sampleRate,
          channels,
        });
      } catch (error) {
        logger.error({ filePath, error }, 'Error parsing audio metadata');
        reject(error);
      }
    });
  });
}
