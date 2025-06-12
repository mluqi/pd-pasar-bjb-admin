"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DB_IURAN extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // DB_IURAN.belongsTo(models.DB_LAPAK, {
      //   foreignKey: "LAPAK_CODE",
      //   targetKey: "LAPAK_CODE",
      // });

      DB_IURAN.belongsTo(models.DB_PEDAGANG, {
        foreignKey: "IURAN_PEDAGANG",
        targetKey: "CUST_CODE",
      });
    }
  }
  DB_IURAN.init(
    {
      IURAN_CODE: {
        type: DataTypes.STRING(25),
        primaryKey: true,
      },
      IURAN_PEDAGANG: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      IURAN_TANGGAL: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      IURAN_JUMLAH: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      IURAN_STATUS: {
        type: DataTypes.ENUM(
          "paid",
          "pending",
          "tidak berjualan",
          "tidak bayar"
        ),
        defaultValue: "pending",
      },
      IURAN_METODE_BAYAR: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      IURAN_WAKTU_BAYAR: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      IURAN_USER: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      IURAN_BUKTI_FOTO: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "DB_IURAN",
      tableName: "DB_IURAN",
    }
  );
  return DB_IURAN;
};
