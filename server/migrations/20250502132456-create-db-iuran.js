"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DB_IURAN", {
      IURAN_CODE: {
        type: Sequelize.STRING(25),
        primaryKey: true,
        allowNull: false,
      },
      IURAN_PEDAGANG: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: "DB_PEDAGANG",
          key: "CUST_CODE",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      IURAN_TANGGAL: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      IURAN_JUMLAH: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      IURAN_STATUS: {
        type: Sequelize.ENUM(
          "paid",
          "pending",
          "tidak berjualan",
          "tidak bayar"
        ),
        defaultValue: "pending",
        allowNull: false,
      },
      IURAN_METODE_BAYAR: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      IURAN_WAKTU_BAYAR: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      IURAN_USER: {
        type: Sequelize.STRING(25),
        allowNull: true,
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
    await queryInterface.dropTable("DB_IURANs");
  },
};
