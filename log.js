const bunyan = require("bunyan");

const log = bunyan.createLogger({
  name: "decision-board",
  level: "info",
  streams: [
    {
      level: "warn",
      stream: process.stdout,
    },
  ],
  serializers: {
    err: bunyan.stdSerializers.err,
    req: bunyan.stdSerializers.req,
  },
});
log.info("hi");
module.exports = log;
