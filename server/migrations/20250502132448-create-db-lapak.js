"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DB_LAPAK", {
      LAPAK_CODE: {
        type: Sequelize.STRING(50),
        primaryKey: true,
      },
      LAPAK_NAMA: {
        type: Sequelize.STRING(150),
      },
      LAPAK_BLOK: {
        type: Sequelize.STRING(50),
      },
      LAPAK_UKURAN: {
        type: Sequelize.STRING(50),
      },
      LAPAK_TYPE: {
        type: Sequelize.STRING(50),
      },
      LAPAK_PENYEWA: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      LAPAK_MULAI: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      LAPAK_AKHIR: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      LAPAK_STATUS: {
        type: Sequelize.ENUM("aktif", "kosong", "rusak"),
        defaultValue: "kosong",
      },
      LAPAK_OWNER: {
        type: Sequelize.STRING(50),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DB_LAPAKs");
  },
};
