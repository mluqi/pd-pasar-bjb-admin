'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DB_TYPE_LAPAK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DB_TYPE_LAPAK.hasMany(models.DB_LAPAK, {
        foreignKey: 'LAPAK_TYPE',
        sourceKey: 'TYPE_CODE'
      });
    }
  }
  DB_TYPE_LAPAK.init({
    TYPE_CODE: { type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    TYPE_NAMA: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'DB_TYPE_LAPAK',
    tableName: 'DB_TYPE_LAPAK',
    timestamps: false,
  });
  return DB_TYPE_LAPAK;
};