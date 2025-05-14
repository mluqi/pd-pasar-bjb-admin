'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DB_PEDAGANG', 'CUST_IURAN', {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: 'CUST_OWNER',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DB_PEDAGANG', 'CUST_IURAN');
  }
};