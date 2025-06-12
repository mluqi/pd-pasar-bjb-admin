"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("DB_LAPAK", "LAPAK_BUKTI_FOTO", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("DB_LAPAK", "LAPAK_BUKTI_FOTO");
  },
};
