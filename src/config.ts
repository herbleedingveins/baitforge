import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DISCORD_TOKEN',
  'APPLICATION_ID',
  'OWNER_USER_ID',
  'ALLOWED_CHANNEL_ID'
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN!,
    applicationId: process.env.APPLICATION_ID!,
  },
  owner: {
    userId: process.env.OWNER_USER_ID!,
  },
  channel: {
    allowedId: process.env.ALLOWED_CHANNEL_ID!,
  },
  storage: {
    path: process.env.STORAGE_PATH || './storage',
    databaseUrl: process.env.DATABASE_URL || 'sqlite:///./baitforge.db',
  },
  audio: {
    maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '25', 10),
    defaultLoudnessDb: parseInt(process.env.DEFAULT_LOUDNESS_DB || '0', 10),
    maxLoudnessDb: parseInt(process.env.MAX_LOUDNESS_DB || '18', 10),
    tempDir: process.env.TEMP_DIR || './temp',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  nodeEnv: process.env.NODE_ENV || 'production',
} as const;

// Validate loudness limits
if (config.audio.defaultLoudnessDb < 0 || config.audio.defaultLoudnessDb > config.audio.maxLoudnessDb) {
  throw new Error('DEFAULT_LOUDNESS_DB must be between 0 and MAX_LOUDNESS_DB');
}
