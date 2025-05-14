'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DB_PEDAGANG', 'CUST_STATUS', {
      type: Sequelize.ENUM("aktif", "nonaktif"),
      allowNull: true,
      after: 'CUST_OWNER',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DB_PEDAGANG', 'CUST_STATUS');
  }
};