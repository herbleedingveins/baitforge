import { describe, it, expect, beforeEach } from 'vitest';
import { config } from '../src/config';

describe('Configuration', () => {
  it('should load all required environment variables', () => {
    expect(config.discord.token).toBeDefined();
    expect(config.discord.applicationId).toBe('1549619187398352997');
    expect(config.owner.userId).toBeDefined();
    expect(config.channel.allowedId).toBe('1549621880846164069');
  });

  it('should have valid loudness limits', () => {
    expect(config.audio.maxLoudnessDb).toBe(18);
    expect(config.audio.defaultLoudnessDb).toBe(0);
    expect(config.audio.maxUploadSizeMb).toBe(25);
  });

  it('should validate loudness constraints', () => {
    expect(config.audio.defaultLoudnessDb).toBeGreaterThanOrEqual(0);
    expect(config.audio.defaultLoudnessDb).toBeLessThanOrEqual(config.audio.maxLoudnessDb);
  });
});
