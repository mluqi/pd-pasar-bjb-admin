'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userakses', {
      user_code: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_name: {
        type: Sequelize.STRING
      },
      user_pass: {
        type: Sequelize.TEXT
      },
      user_phone: {
        type: Sequelize.STRING
      },
      user_email: {
        type: Sequelize.STRING
      },
      user_level: {
        type: Sequelize.STRING
      },
      user_foto: {
        type: Sequelize.TEXT
      },
      user_owner: {
        type: Sequelize.STRING
      },
      user_status: {
        type: Sequelize.ENUM('A', 'N')
      },
      user_validation: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('userakses');
  }
};