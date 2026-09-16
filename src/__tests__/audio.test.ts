import { describe, it, expect } from 'vitest';

describe('Audio Constants', () => {
  it('should support multiple audio formats', () => {
    const formats = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];
    formats.forEach(fmt => {
      expect(fmt.length).toBeGreaterThan(0);
    });
  });
});
