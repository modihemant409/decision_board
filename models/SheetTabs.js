const { Sequelize, DataTypes, Model } = require("sequelize");
const Logo = require("./Logo");
const connection = require("../db/connection");
const Sheet = require("./Sheet");
const Tab = require("./Tab");

class SheetTab extends Model {}

SheetTab.init(
  {},
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "sheetTabs", // We need to choose the model name
    tableName: "sheetTabs",
  }
);

Sheet.hasMany(SheetTab);
SheetTab.belongsTo(Sheet);

Tab.hasMany(SheetTab);
SheetTab.belongsTo(Tab);

module.exports = SheetTab;
