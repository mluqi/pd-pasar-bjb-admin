'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LOG_AKSES extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LOG_AKSES.init({
    AKSES_USER: DataTypes.STRING,
    AKSES_IP: DataTypes.STRING,
    AKSES_BROWSER: DataTypes.STRING,
    AKSES_STATUS: DataTypes.STRING,
    AKSES_RECORD: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LOG_AKSES',
  });
  return LOG_AKSES;
};