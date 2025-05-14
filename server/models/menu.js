"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MENU extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MENU.belongsTo(models.MENU, {
        as: "Parent",
        foreignKey: "MENU_PARENT_ID",
        targetKey: "id",
      });
      MENU.hasMany(models.MENU, {
        as: "SubMenus",
        foreignKey: "MENU_PARENT_ID",
        sourceKey: "id",
      });
    }
  }
  MENU.init(
    {
      MENU_GROUP: DataTypes.STRING,
      MENU_NAMA: DataTypes.STRING,
      MENU_PATH: DataTypes.STRING,
      MENU_PARENT_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MENU",
      tableName: "MENU",
      timestamps: false,
    }
  );
  return MENU;
};
