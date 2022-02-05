const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");

class Logo extends Model {}

Logo.init(
  {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "logos", // We need to choose the model name
    tableName: "logos",
  }
);

User.hasMany(Logo);
Logo.belongsTo(User);
module.exports = Logo;
