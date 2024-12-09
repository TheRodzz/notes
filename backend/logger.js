const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Log only if level is less severe than info
  format: winston.format.json(),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(), // Simple console output
    }),
  ],
});

module.exports = logger;