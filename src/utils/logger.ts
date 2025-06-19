enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

const log = (level: LogLevel, message: string, context?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (context) {
    console.log(logMessage, JSON.stringify(context));
  } else {
    console.log(logMessage);
  }
};

const logger = {
  info: (message: string, context?: Record<string, any>) => {
    log(LogLevel.INFO, message, context);
  },
  warn: (message: string, context?: Record<string, any>) => {
    log(LogLevel.WARN, message, context);
  },
  error: (message: string, context?: Record<string, any>) => {
    log(LogLevel.ERROR, message, context);
  },
  debug: (message: string, context?: Record<string, any>) => {
    // Only log debug messages in development environments
    if (process.env.NODE_ENV === 'development') {
      log(LogLevel.DEBUG, message, context);
    }
  },
};

export default logger;