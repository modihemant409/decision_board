const { DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");
const Sheet = require("./Sheet");
const SheetTab = require("./SheetTabs");
const Tab = require("./Tab");

class Chart extends Model {}

Chart.init(
  {
    // Model attributes are defined here
    chart_data: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        return this.setDataValue("chart_data", JSON.stringify(value));
      },
      get() {
        const rawValue = this.getDataValue("chart_data");
        return rawValue ? JSON.parse(rawValue) : null;
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "charts", // We need to choose the model name
    tableName: "charts",
  }
);

Tab.hasMany(Chart);
Chart.belongsTo(Tab);

module.exports = Chart;
