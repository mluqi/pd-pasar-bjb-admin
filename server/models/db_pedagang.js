'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DB_PEDAGANG extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DB_PEDAGANG.hasMany(models.DB_LAPAK, {
        foreignKey: "LAPAK_PENYEWA",
        sourceKey: "CUST_CODE",
        as: "lapaks",
      });

      DB_PEDAGANG.hasMany(models.DB_IURAN, {
        foreignKey: "IURAN_PEDAGANG",
        sourceKey: "CUST_CODE",
        as: "iurans",
      });
      DB_PEDAGANG.belongsTo(models.data_pasar, {
        foreignKey: "CUST_OWNER",
        targetKey: "pasar_code",
        as: "pasar",
      });
    }
  }
  DB_PEDAGANG.init({
    CUST_CODE: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    CUST_NAMA: DataTypes.STRING(150),
    CUST_NIK: DataTypes.STRING(50),
    CUST_PHONE: DataTypes.STRING(50),
    CUST_OWNER: DataTypes.STRING(50),
    CUST_IURAN: DataTypes.STRING(50),
    CUST_STATUS: DataTypes.ENUM("aktif", "nonaktif"),
  }, {
    sequelize,
    modelName: 'DB_PEDAGANG',
    tableName: 'DB_PEDAGANG',
  });
  return DB_PEDAGANG;
};