'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LOG_ACTIVITY extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LOG_ACTIVITY.init({
    LOG_TARGET: DataTypes.STRING,
    LOG_USER: DataTypes.STRING,
    LOG_ACTION: DataTypes.TEXT,
    LOG_DETAIL: DataTypes.TEXT,
    LOG_SOURCE: DataTypes.TEXT,
    LOG_RECORD: DataTypes.DATE,
    LOG_OWNER: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LOG_ACTIVITY',
  });
  return LOG_ACTIVITY;
};