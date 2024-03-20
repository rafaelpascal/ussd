const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const logDir = "logs"; // Define your log directory here
const moment = require("moment");

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define a custom formatter to format the log messages
const customFormatter = format.printf(({ level, message, timestamp }) => {
  // Parse the JSON message
  const parsedMessage = JSON.parse(message);

  // Format the log message with line breaks
  return `${timestamp} - ${level}: \n${JSON.stringify(parsedMessage, null, 2)}`;
});

// file name for the log
const logName = moment().format("DD_MMM_YYYY");

// Create the logger with the custom formatter
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), customFormatter),
  transports: [new transports.File({ filename: `${logDir}/${logName}.log` })],
});

module.exports = logger;
