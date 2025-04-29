'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class userakses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      use
    }
  }
  userakses.init({
    user_code: DataTypes.STRING,
    user_name: DataTypes.STRING,
    user_pass: DataTypes.TEXT,
    user_phone: DataTypes.STRING,
    user_email: DataTypes.STRING,
    user_level: DataTypes.STRING,
    user_foto: DataTypes.TEXT,
    user_owner: DataTypes.STRING,
    user_status: DataTypes.ENUM('A', 'N'),
    user_validation: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'userakses',
  });
  return userakses;
};