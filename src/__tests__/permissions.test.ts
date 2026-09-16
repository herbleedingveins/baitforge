import { describe, it, expect, beforeEach } from 'vitest';
import { isAllowedChannel, isOwner, requireAllowedChannel, requireOwner } from '../src/security/permissions';
import { config } from '../src/config';

describe('Permission Guards', () => {
  describe('isAllowedChannel', () => {
    it('should return true for allowed channel', () => {
      const result = isAllowedChannel(config.channel.allowedId);
      expect(result).toBe(true);
    });

    it('should return false for wrong channel', () => {
      const result = isAllowedChannel('999999999999999999');
      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for owner user ID', () => {
      const result = isOwner(config.owner.userId);
      expect(result).toBe(true);
    });

    it('should return false for non-owner', () => {
      const result = isOwner('999999999999999999');
      expect(result).toBe(false);
    });
  });
});
