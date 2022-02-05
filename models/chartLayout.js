const { DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");
const Sheet = require("./Sheet");
const SheetTab = require("./SheetTabs");
const Tab = require("./Tab");

class ChartLayout extends Model {}

ChartLayout.init(
  {
    // Model attributes are defined here
    layout_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        return this.setDataValue("ChartLayout_data", JSON.stringify(value));
      },
      get() {
        const rawValue = this.getDataValue("ChartLayout_data");
        return rawValue ? JSON.parse(rawValue) : null;
      },
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "chartLayouts", // We need to choose the model name
    tableName: "chartLayouts",
  }
);

Tab.hasOne(ChartLayout);
ChartLayout.belongsTo(Tab);

module.exports = ChartLayout;
