const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");
const Dashboard = require("./Dashboard");

class Sheet extends Model {}

Sheet.init(
  {
    // Model attributes are defined here
    spreadsheetId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sheet_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rows: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    columns: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "sheets", // We need to choose the model name
    tableName: "sheets",
  }
);

User.hasMany(Sheet);
Sheet.belongsTo(User);

Dashboard.hasMany(Sheet);
Sheet.belongsTo(Dashboard);

module.exports = Sheet;
