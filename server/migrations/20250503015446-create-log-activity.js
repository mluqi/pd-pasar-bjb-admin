'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LOG_ACTIVITY', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      LOG_TARGET: {
        type: Sequelize.STRING
      },
      LOG_USER: {
        type: Sequelize.STRING
      },
      LOG_ACTION: {
        type: Sequelize.TEXT
      },
      LOG_DETAIL: {
        type: Sequelize.TEXT
      },
      LOG_SOURCE: {
        type: Sequelize.TEXT
      },
      LOG_RECORD: {
        type: Sequelize.DATE
      },
      LOG_OWNER: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('LOG_ACTIVITY');
  }
};