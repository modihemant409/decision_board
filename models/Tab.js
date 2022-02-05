const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");
const Dashboard = require("./Dashboard");
const Logo = require("./Logo");

class Tab extends Model {}

Tab.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    report_for: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "tabs", // We need to choose the model name
    tableName: "tabs",
  }
);

Dashboard.hasMany(Tab), Tab.belongsTo(Dashboard);

Logo.hasMany(Tab, { as: "logo", foreignKey: "logoId" });
Tab.belongsTo(Logo, { as: "logo", foreignKey: "logoId" });

Logo.hasMany(Tab, { as: "banner", foreignKey: "bannerId" });
Tab.belongsTo(Logo, { as: "banner", foreignKey: "bannerId" });

module.exports = Tab;
