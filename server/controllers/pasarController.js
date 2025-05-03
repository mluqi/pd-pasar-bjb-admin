const { data_pasar } = require("../models");
const { Op } = require("sequelize");

exports.addPasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_nama, pasar_status } = req.body;

    if (!pasar_nama || !pasar_status) {
      return res
        .status(400)
        .json({ message: "Nama dan status pasar diperlukan." });
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
      return res.status(400).json({ message });
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
        const lastNum = parseInt(lastPasar.pasar_code.substring(3), 10); // Ambil angka setelah 'PSR'
        if (!isNaN(lastNum)) {
          nextSequence = lastNum + 1;
        }
      } catch (e) {
        console.error(
          "Error parsing last pasar_code:",
          lastPasar.pasar_code,
          e
        );
        return res
          .status(500)
          .json({ message: "Gagal memproses kode pasar terakhir." });
      }
    }
    const generatedPasarCode = `PSR${nextSequence.toString().padStart(4, "0")}`;

    const newPasar = await data_pasar.create({
      pasar_code: generatedPasarCode,
      pasar_nama,
      pasar_status,
      pasar_logo: pasar_logo_filename,
    });

    res
      .status(201)
      .json({ message: "Pasar berhasil ditambahkan.", data: newPasar });
  } catch (error) {
    console.error("Error adding pasar:", error);
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
  if (!req.user || !req.user.id || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const allPasar = await data_pasar.findAll();
    res.json(allPasar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

exports.editPasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_code } = req.params;
    const { pasar_nama, pasar_status } = req.body;

    if (!pasar_nama || !pasar_status) {
      return res
        .status(400)
        .json({ message: "Nama dan status pasar diperlukan." });
    }

    const pasar = await data_pasar.findOne({ where: { pasar_code } });

    if (!pasar) {
      return res.status(404).json({ message: "Pasar tidak ditemukan." });
    }

    const fotoPasar = req.file ? req.file.filename : null;

    const data = await pasar.update({
      pasar_nama,
      pasar_status,
      pasar_logo: fotoPasar || pasar.pasar_logo,
    });

    return res
      .status(201)
      .json({ message: "Pasar berhasil diperbarui.", data: data });
  } catch (error) {
    console.error("Error editing pasar:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePasar = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;

  if (userLevel != "SUA") {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const { pasar_code } = req.params;

    const pasar = await data_pasar.findOne({ where: { pasar_code } });

    if (!pasar) {
      return res.status(404).json({ message: "Pasar tidak ditemukan." });
    }

    await pasar.destroy();

    return res.json({ message: "Pasar berhasil dihapus." });
  } catch {
    return res.status(500).json({
      message: error.message,
    });
  }
};
