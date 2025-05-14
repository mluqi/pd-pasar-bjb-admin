'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('USER_LEVEL_AKSES', {
      LEVAC_CODE: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.STRING
      },
      LEVAC_MASTER: {
        type: Sequelize.STRING
      },
      LEVAC_MENU: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('USER_LEVEL_AKSES');
  }
};