import pino from 'pino';
import { config } from '../config';

const logLevel = config.logging.level;

const transport = config.nodeEnv === 'production' 
  ? undefined 
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });

export const logger = pino(
  {
    level: logLevel,
    base: undefined,
  },
  transport
);

// Never log secrets
export function sanitizeForLog(obj: any): any {
  if (!obj) return obj;
  const sanitized = JSON.parse(JSON.stringify(obj));
  const secretKeys = ['token', 'password', 'secret', 'key', 'apiKey'];
  
  const recursive = (o: any) => {
    for (const key of Object.keys(o || {})) {
      if (secretKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        o[key] = '***REDACTED***';
      } else if (typeof o[key] === 'object' && o[key] !== null) {
        recursive(o[key]);
      }
    }
  };
  
  recursive(sanitized);
  return sanitized;
}
