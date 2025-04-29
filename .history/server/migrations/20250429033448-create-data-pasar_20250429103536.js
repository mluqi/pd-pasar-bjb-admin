'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('data_pasars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pasar_code: {
        type: Sequelize.STRING
      },
      pasar_nama: {
        type: Sequelize.STRING
      },
      pasar_logo: {
        type: Sequelize.TEXT
      },
      pasar_status: {
        type: Sequelize.ENUM('A', 'N')
      },
      pasar_token: {
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
    await queryInterface.dropTable('data_pasars');
  }
};