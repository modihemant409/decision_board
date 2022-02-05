const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const connection = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
    logging: false,
  }
);

connection
  .authenticate()
  .then((res) => {
    console.log("Connection established with database.");
  })
  .catch((error) => {
    throw error;
  });

module.exports = connection;
