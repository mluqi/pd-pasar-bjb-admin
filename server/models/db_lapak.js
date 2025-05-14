"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DB_LAPAK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DB_LAPAK.belongsTo(models.DB_PEDAGANG, {
        foreignKey: "LAPAK_PENYEWA",
        targetKey: "CUST_CODE",
      });
      DB_LAPAK.belongsTo(models.DB_TYPE_LAPAK, {
        foreignKey: "LAPAK_TYPE",
        targetKey: "TYPE_CODE",
      });
      DB_LAPAK.belongsTo(models.data_pasar, {
        foreignKey: "LAPAK_OWNER",
        targetKey: "pasar_code",
        as: "pasar",
      });
    }
  }
  DB_LAPAK.init(
    {
      LAPAK_CODE: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
      LAPAK_NAMA: DataTypes.STRING(150),
      LAPAK_BLOK: DataTypes.STRING(50),
      LAPAK_UKURAN: DataTypes.STRING(50),
      LAPAK_TYPE: DataTypes.STRING(50),
      LAPAK_PENYEWA: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      LAPAK_MULAI: { type: DataTypes.DATE,
        allowNull: true,
      },
      LAPAK_AKHIR: { type: DataTypes.DATE,
        allowNull: true,
      },
      LAPAK_STATUS: DataTypes.ENUM("aktif", "kosong", "rusak"),
      LAPAK_OWNER: { type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "DB_LAPAK",
      tableName: "DB_LAPAK",
    }
  );
  return DB_LAPAK;
};
