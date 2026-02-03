// lib/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, error?: Error | unknown, data?: unknown) => void;
}

function serializeError(err: unknown): LogEntry['error'] | undefined {
  if (!err) return undefined;
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return {
    name: 'UnknownError',
    message: String(err),
  };
}

function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function shouldLog(level: LogLevel): boolean {
  if (level === 'debug') {
    return process.env.NODE_ENV === 'development';
  }
  return true;
}

export function createLogger(context: string): Logger {
  const logWithLevel = (
    level: LogLevel,
    message: string,
    data?: unknown,
    error?: unknown
  ): void => {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error: serializeError(error) }),
    };

    const output = formatLogEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  };

  return {
    debug: (message, data) => logWithLevel('debug', message, data),
    info: (message, data) => logWithLevel('info', message, data),
    warn: (message, data) => logWithLevel('warn', message, data),
    error: (message, error, data) => logWithLevel('error', message, data, error),
  };
}

// Default logger without context for quick access
export const log = createLogger('app');
