const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");

class Dashboard extends Model {}

Dashboard.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    period: {
      type: DataTypes.ENUM("month", "year", "week"),
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "dashboard", // We need to choose the model name
    tableName: "dashboard",
  }
);

User.hasMany(Dashboard);
Dashboard.belongsTo(User);
module.exports = Dashboard;
