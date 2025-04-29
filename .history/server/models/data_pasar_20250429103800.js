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
      
    }
  }
  data_pasar.init({
    pasar_code: DataTypes.STRING,
    pasar_nama: DataTypes.STRING,
    pasar_logo: DataTypes.TEXT,
    pasar_status: DataTypes.ENUM('A', 'N'),
    pasar_token: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'data_pasar',
  });
  return data_pasar;
};