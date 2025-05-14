"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class USER_LEVEL_AKSES extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  USER_LEVEL_AKSES.init(
    {
      LEVAC_CODE: { type: DataTypes.STRING(50), primaryKey: true },
      LEVAC_MASTER: DataTypes.STRING,
      LEVAC_MENU: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "USER_LEVEL_AKSES",
      tableName: "USER_LEVEL_AKSES",
      timestamps: false,
    }
  );
  return USER_LEVEL_AKSES;
};
