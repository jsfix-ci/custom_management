const { createLogger, format, winston, transports } = require("winston");
const CustomTransport = require("./helpers/customTransport");
const moment = require("moment");

/*const logger = createLogger({
  transports: [
    new transports.File({
      filename: "server/logs/info.json",
      level: "info",
      prettyPrint: JSON.stringify,
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "server/logs/error.json",
      level: "error",
      prettyPrint: JSON.stringify,
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});*/

const logger = createLogger({
  format: format.json(),
  transports: [
    new CustomTransport({
      filename: "\\logs\\error.log",
      level: "error",
      prettyPrint: JSON.stringify,
      format: format.combine(format.timestamp(), format.json()),
      handleExceptions: true,
    }),
    new CustomTransport({
      filename: "\\logs\\info.log",
      level: "info",
      prettyPrint: JSON.stringify,
      format: format.combine(format.timestamp(), format.json()),
      handleExceptions: true,
    }),
    new CustomTransport({
      filename: "\\logs\\warn.log",
      level: "warn",
      prettyPrint: JSON.stringify,
      format: format.combine(format.timestamp(), format.json()),
      handleExceptions: true,
    }),
  ],
});
/*const logger = createLogger({
  transports: [
    new transports.Console()
  ],
});*/

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;