const { Sequelize, DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");
const Sheet = require("./Sheet");

class SheetData extends Model {}

SheetData.init(
  {
    sheet_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        return this.setDataValue("sheet_data", JSON.stringify(value));
      },
      // get() {
      //   const rawValue = this.getDataValue("sheet_data");
      //   return rawValue ? JSON.parse(rawValue) : null;
      // },
    },
    sheet_column: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        return this.setDataValue("sheet_column", JSON.stringify(value));
      },
      // get() {
      //   const rawValue = this.getDataValue("sheet_column");
      //   return rawValue ? JSON.parse(rawValue) : null;
      // },
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "sheetData", // We need to choose the model name
    tableName: "sheetData",
  }
);

Sheet.hasOne(SheetData);
SheetData.belongsTo(Sheet);

module.exports = SheetData;
