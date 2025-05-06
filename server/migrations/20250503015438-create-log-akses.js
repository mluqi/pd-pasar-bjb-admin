'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LOG_AKSES', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AKSES_USER: {
        type: Sequelize.STRING
      },
      AKSES_IP: {
        type: Sequelize.STRING
      },
      AKSES_BROWSER: {
        type: Sequelize.STRING
      },
      AKSES_STATUS: {
        type: Sequelize.STRING
      },
      AKSES_RECORD: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('LOG_AKSES');
  }
};