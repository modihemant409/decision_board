const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./User");
const connection = require("../db/connection");
const Plan = require("./Plans");

class UserPlan extends Model {}

UserPlan.init(
  {
    valid_till: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0",
    },
    is_active: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "1",
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "UserPlans", // We need to choose the model name
    tableNam: "UserPlans",
  }
);
User.hasMany(UserPlan);
UserPlan.belongsTo(User);

Plan.hasMany(UserPlan);
UserPlan.belongsTo(Plan);

module.exports = UserPlan;
