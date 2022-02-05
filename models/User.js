const { Sequelize, DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");

class User extends Model {}

User.init(
  {
    // Model attributes are defined here

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    device_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_blocked: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "users", // We need to choose the model name
    tableName: "users",
  }
);

module.exports = User;
