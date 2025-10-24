"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoices.belongsTo(models.data_pasar, {
        foreignKey: "invoice_pasar",
        targetKey: "pasar_code",
        as: "pasar",
      });
      Invoices.belongsTo(models.DB_PEDAGANG, {
        foreignKey: "invoice_pedagang",
        targetKey: "CUST_CODE",
        as: "pedagang",
      });
    }
  }
  Invoices.init(
    {
      invoice_code: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      invoice_pedagang: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "DB_PEDAGANG",
          key: "CUST_CODE",
        },
      },
      invoice_nominal: DataTypes.BIGINT,
      invoice_date: DataTypes.DATEONLY,
      invoice_tempo: DataTypes.DATEONLY,
      invoice_type: DataTypes.ENUM("siptu", "heregistrasi"),
      invoice_pasar: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "data_pasars",
          key: "pasar_code",
        },
      },
      invoice_lapak: {
        type: DataTypes.TEXT, // Ubah tipe data menjadi JSON
        allowNull: true,
        get() {
          const rawValue = this.getDataValue("invoice_lapak");
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue("invoice_lapak", JSON.stringify(value));
          } else {
            this.setDataValue("invoice_lapak", value);
          }
        },
      },
      invoice_status: DataTypes.ENUM("pending", "paid", "waiting"),
      invoice_file: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Invoices",
      tableName: "Invoices",
    }
  );

  return Invoices;
};
