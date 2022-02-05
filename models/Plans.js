const { Sequelize, DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");

class Plan extends Model {}

Plan.init(
  {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    validity_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    dashboard_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_blocked: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
    },
    total_sales: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "plans", // We need to choose the model name
    tableName: "plans",
  }
);

module.exports = Plan;
