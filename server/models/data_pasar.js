'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class data_pasar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      data_pasar.hasMany(models.userakses, {
        foreignKey: 'user_owner',
        sourceKey: 'pasar_code',
        as: 'users'
      });
      data_pasar.hasMany(models.DB_LAPAK, {
        foreignKey: 'LAPAK_OWNER',
        sourceKey: 'pasar_code',
        as: 'lapaks'
      });
    }
  }
  data_pasar.init({
    pasar_code: {
      type: DataTypes.STRING,
      primaryKey: true 
    },
    pasar_nama: DataTypes.STRING,
    pasar_logo: DataTypes.TEXT,
    pasar_status: DataTypes.ENUM('A', 'N'),
    pasar_qrcode: DataTypes.TEXT,
    pasar_tanggal_jatuh_tempo: {
      type: DataTypes.STRING(5), // Format MM-DD
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'data_pasar',
    tableName: 'data_pasars',
  });
  return data_pasar;
};