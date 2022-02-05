const mysql = require("mysql2/promise");
const logger = require("../log");

const dotenv = require("dotenv");

dotenv.config();

const options = {
  connectionLimit: 50,
  host: "localhost",
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  Promise: Promise,
  multipleStatements: true,
};

const pool = mysql.createPool(options);

const CONNECTION_LOST = "PROTOCOL_CONNECTION_LOST";
const EPIPE = "EPIPE";

const wrapper = {};

wrapper.query = (queryString, queryArgs) => {
  return pool.query(queryString, queryArgs).catch((err) => {
    if (err.code == CONNECTION_LOST || err.code == EPIPE) {
      logger.error({ err }, "PROTOCOL_CONNECTION_LOST|EPIPE - Retrying!");
      return wrapper.query(queryString, queryArgs);
    }
    logger.error({ err, queryString }, "DB_QUERY_FAILED_WITHOUT_RETRY");
    return Promise.reject(err);
  });
};

wrapper.getConnection = () => pool.getConnection();

module.exports = wrapper;
