'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DB_LAPAK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DB_LAPAK.belongsTo(models.DB_PEDAGANG, {
        foreignKey: "LAPAK_PENYEWA",
        targetKey: "CUST_CODE",
      });

      DB_LAPAK.hasMany(models.DB_IURAN, {
        foreignKey: "LAPAK_CODE",
        sourceKey: "LAPAK_CODE",
      });
    }
  }
  DB_LAPAK.init({
    LAPAK_CODE: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    LAPAK_NAMA: DataTypes.STRING(150),
    LAPAK_BLOK: DataTypes.STRING(50),
    LAPAK_UKURAN: DataTypes.STRING(50),
    LAPAK_TYPE: DataTypes.STRING(50),
    LAPAK_PENYEWA: DataTypes.STRING(50),
    LAPAK_MULAI: DataTypes.DATE,
    LAPAK_AKHIR: DataTypes.DATE,
    LAPAK_STATUS: DataTypes.ENUM('aktif', 'kosong', 'rusak'),
    LAPAK_OWNER: DataTypes.STRING(50),
  }, {
    sequelize,
    modelName: 'DB_LAPAK',
  });
  return DB_LAPAK;
};