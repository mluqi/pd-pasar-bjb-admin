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
    await queryInterface.addColumn("data_pasars", "pasar_tanggal_jatuh_tempo", {
      type: Sequelize.STRING(5), // Format MM-DD
      allowNull: true,
      after: "pasar_qrcode",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(
      "data_pasars",
      "pasar_tanggal_jatuh_tempo"
    );
  },
};
