import { describe, it, expect } from 'vitest';
import { formatDuration, formatFileSize } from '../src/utils/files';

describe('File Utilities', () => {
  describe('formatDuration', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(161)).toBe('2:41');
      expect(formatDuration(3661)).toBe('61:01');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes to MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(5.12 * 1024 * 1024)).toBe('5.12 MB');
    });
  });
});
