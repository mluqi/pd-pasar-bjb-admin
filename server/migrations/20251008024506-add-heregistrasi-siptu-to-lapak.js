"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("DB_LAPAK", "LAPAK_HEREGISTRASI", {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: "LAPAK_STATUS",
    });
    await queryInterface.addColumn("DB_LAPAK", "LAPAK_SIPTU", {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: "LAPAK_HEREGISTRASI",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("DB_LAPAK", "LAPAK_HEREGISTRASI");
    await queryInterface.removeColumn("DB_LAPAK", "LAPAK_SIPTU");
  },
};
