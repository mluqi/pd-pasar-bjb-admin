"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Invoices", {
      invoice_code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      invoice_pedagang: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "DB_PEDAGANG",
          key: "CUST_CODE",
        },
      },
      invoice_nominal: {
        type: Sequelize.BIGINT,
      },
      invoice_date: {
        type: Sequelize.DATEONLY,
      },
      invoice_tempo: {
        type: Sequelize.DATEONLY,
      },
      invoice_type: {
        type: Sequelize.ENUM("siptu", "heregistrasi"),
      },
      invoice_lapak: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "DB_LAPAK",
          key: "LAPAK_CODE",
        },
      },
      invoice_pasar: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "data_pasars",
          key: "pasar_code",
        },
      },
      invoice_status: {
        type: Sequelize.ENUM("pending", "paid", "waiting"),
      },
      invoice_file: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Invoices");
  },
};
