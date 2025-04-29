'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_level extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_level.init({
    level_code: DataTypes.STRING,
    level_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_level',
  });
  return user_level;
};