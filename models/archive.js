const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");
const Dashboard = require("./Dashboard");

class ArchiveDashboard extends Model {}

ArchiveDashboard.init(
  {},
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "archiveDashboard", // We need to choose the model name
    tableName: "archiveDashboard",
  }
);

Dashboard.hasMany(ArchiveDashboard);
ArchiveDashboard.belongsTo(Dashboard);
User.hasMany(ArchiveDashboard);
ArchiveDashboard.belongsTo(User);

module.exports = ArchiveDashboard;
