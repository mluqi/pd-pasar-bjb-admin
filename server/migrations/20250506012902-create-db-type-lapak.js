'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DB_TYPE_LAPAK', {
      TYPE_CODE: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      TYPE_NAMA: {
        type: Sequelize.STRING(150),
        allowNull: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DB_TYPE_LAPAK');
  }
};