import { describe, it, expect } from 'vitest';
import { sanitizeForLog } from '../src/utils/logger';

describe('Logger Utilities', () => {
  describe('sanitizeForLog', () => {
    it('should redact token field', () => {
      const input = { token: 'secret-token-123', name: 'test' };
      const result = sanitizeForLog(input);
      expect(result.token).toBe('***REDACTED***');
      expect(result.name).toBe('test');
    });

    it('should redact password field', () => {
      const input = { password: 'secret-pwd', user: 'admin' };
      const result = sanitizeForLog(input);
      expect(result.password).toBe('***REDACTED***');
    });

    it('should redact nested secrets', () => {
      const input = { 
        db: { 
          apiKey: 'secret-key',
          host: 'localhost'
        }
      };
      const result = sanitizeForLog(input);
      expect(result.db.apiKey).toBe('***REDACTED***');
      expect(result.db.host).toBe('localhost');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeForLog(null)).toBe(null);
      expect(sanitizeForLog(undefined)).toBe(undefined);
    });
  });
});
