"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DB_PEDAGANG", {
      CUST_CODE: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      CUST_NAMA: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      CUST_NIK: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      CUST_PHONE: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      CUST_OWNER: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DB_PEDAGANGs");
  },
};
