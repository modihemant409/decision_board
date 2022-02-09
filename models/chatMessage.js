const { DataTypes, Model } = require("sequelize");
const connection = require("../db/connection");
const User = require("./User");

class ChatMessage extends Model {}

ChatMessage.init(
  {
    // Model attributes are defined here
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "text",
    },
    from: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
  },
  {
    // Other model options go here
    sequelize: connection, // We need to pass the connection instance
    modelName: "chatMessage", // We need to choose the model name
    tableName: "chatMessages",
  }
);

User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);

module.exports = ChatMessage;
