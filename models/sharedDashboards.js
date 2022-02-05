const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");
const Dashboard = require("./Dashboard");

class SharedDashboard extends Model {}

SharedDashboard.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "sharedDashboards", // We need to choose the model name
    tableName: "sharedDashboards",
  }
);

Dashboard.hasMany(SharedDashboard);
SharedDashboard.belongsTo(Dashboard);

User.hasMany(SharedDashboard, { foreignKey: "email" });
SharedDashboard.belongsTo(User, { foreignKey: "email" });

module.exports = SharedDashboard;
