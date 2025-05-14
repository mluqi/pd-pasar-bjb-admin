const { data_pasar } = require("../models");
const { Op } = require("sequelize");
const { addLogActivity } = require("./logController");

exports.addPasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_nama, pasar_status } = req.body;

    if (!pasar_nama || !pasar_status) {
      res.status(400).json({ message: "Nama dan status pasar diperlukan." });
    }

    const existingPasar = await data_pasar.findOne({
      where: {
        [Op.or]: [{ pasar_nama: pasar_nama }],
      },
    });

    if (existingPasar) {
      let message = "Data sudah digunakan.";
      if (existingPasar.pasar_nama === pasar_nama) {
        message = "Nama pasar sudah digunakan.";
      }
      res.status(400).json({ message });
    }

    const pasar_logo_filename = req.file ? req.file.filename : null;

    let nextSequence = 1;
    const lastPasar = await data_pasar.findOne({
      where: {
        pasar_code: {
          [Op.like]: "PSR%",
        },
      },
      order: [["pasar_code", "DESC"]],
      attributes: ["pasar_code"],
    });

    if (lastPasar && lastPasar.pasar_code) {
      try {
        const lastNum = parseInt(lastPasar.pasar_code.substring(3), 10);
        if (!isNaN(lastNum)) {
          nextSequence = lastNum + 1;
        }
      } catch (e) {
        console.error(
          "Error parsing last pasar_code:",
          lastPasar.pasar_code,
          e
        );
        res
          .status(500)
          .json({ message: "Gagal memproses kode pasar terakhir." });
      }
    }
    const generatedPasarCode = `PSR${nextSequence.toString().padStart(4, "0")}`;

    const newPasar = await data_pasar.create(
      {
        pasar_code: generatedPasarCode,
        pasar_nama,
        pasar_status,
        pasar_logo: pasar_logo_filename,
      },
      {
        logging: (query) => {
          req.sqlQuery = query;
        },
      }
    );

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
      data: req.body,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: generatedPasarCode,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    return res
      .status(201)
      .json({ message: "Pasar berhasil ditambahkan.", data: newPasar });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Gagal menghasilkan kode pasar unik. Coba lagi." });
    }
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat menambahkan pasar." });
  }
};

exports.getAllPasar = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const offset = (page - 1) * limit;

  try {
    const whereClause = {
      [Op.and]: [
        search ? { pasar_nama: { [Op.like]: `%${search}%` } } : {}, // Search by name
        status ? { pasar_status: status } : {}, // Filter by status
      ],
    };

    const { count, rows } = await data_pasar.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["pasar_nama", "ASC"]],
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch pasars:", error);
    res.status(500).json({ message: "Failed to fetch pasars." });
  }
};

exports.getAllPasarWithoutPagination = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (userLevel != "SUA") {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const pasars = await data_pasar.findAll({
      attributes: ["pasar_code", "pasar_nama"],
      where: {
        pasar_status: "A",
      },
      order: [["pasar_nama", "ASC"]],
    });
    res.status(200).json(pasars);
  } catch (error) {
    console.error("Failed to fetch all pasars:", error);
    res.status(500).json({ message: "Failed to fetch all pasars." });
  }
};

exports.editPasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_code } = req.params;
    const { pasar_nama, pasar_status } = req.body;

    if (!pasar_nama || !pasar_status) {
      res.status(400).json({ message: "Nama dan status pasar diperlukan." });
    }

    const pasar = await data_pasar.findOne({ where: { pasar_code } });

    if (!pasar) {
      res.status(404).json({ message: "Pasar tidak ditemukan." });
    }

    const fotoPasar = req.file ? req.file.filename : null;

    const data = await pasar.update(
      {
        pasar_nama,
        pasar_status,
        pasar_logo: fotoPasar || pasar.pasar_logo,
      },
      {
        logging: (query) => {
          req.sqlQuery = query;
        },
      }
    );

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });

    return res
      .status(201)
      .json({ message: "Pasar berhasil diperbarui.", data: data });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_code } = req.params;

    const pasar = await data_pasar.findOne({ where: { pasar_code } });

    if (!pasar) {
      res.status(404).json({ message: "Pasar tidak ditemukan." });
    }

    await pasar.destroy({
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: pasar_code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(200).json({ message: "Pasar berhasil dihapus." });
  } catch {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: pasar_code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(500).json({
      message: error.message,
    });
  }
};
