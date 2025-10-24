const {
  DB_PEDAGANG,
  DB_LAPAK,
  Sequelize,
  data_pasar,
  DB_IURAN,
  Invoices,
} = require("../models");
const fs = require("fs");
const { addLogActivity } = require("./logController");
const { Op } = require("sequelize");

exports.getAllInvoices = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }

  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      startDate = "",
      endDate = "",
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = {};

    if (userLevel !== "SUA") {
      whereClause.invoice_pasar = userPasar;
    }

    if (search) {
      whereClause[Op.or] = [
        { invoice_code: { [Op.like]: `%${search}%` } },
        { "$pedagang.CUST_NAMA$": { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.invoice_status = status;
    }

    if (startDate && endDate) {
      whereClause.invoice_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    let { count, rows } = await Invoices.findAndCountAll({
      where: whereClause,
      include: [
        { model: DB_PEDAGANG, as: "pedagang" },
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_logo"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["invoice_date", "DESC"]],
      // We need Sequelize instances to work with, so raw: false is default and correct
    });

    const totalPages = Math.ceil(count / limit);

    // --- Menambahkan Detail Lapak ---
    // 1. Kumpulkan semua kode lapak dari semua invoice
    const allLapakCodes = rows.flatMap(
      (invoice) => invoice.invoice_lapak || []
    );
    const uniqueLapakCodes = [...new Set(allLapakCodes)];

    if (uniqueLapakCodes.length > 0) {
      // 2. Ambil detail untuk semua lapak yang unik dalam satu query
      const lapakDetails = await DB_LAPAK.findAll({
        where: {
          LAPAK_CODE: {
            [Op.in]: uniqueLapakCodes,
          },
        },
        attributes: ["LAPAK_CODE", "LAPAK_NAMA", "LAPAK_BLOK"],
        raw: true, // Dapatkan objek data biasa untuk pemetaan yang lebih mudah
      });

      // 3. Buat map untuk pencarian cepat: LAPAK_CODE -> { detail }
      const lapakMap = new Map(
        lapakDetails.map((lapak) => [lapak.LAPAK_CODE, lapak])
      );

      // 4. Sematkan detail lapak kembali ke setiap invoice
      rows = rows.map((invoice) => {
        const invoiceData = invoice.toJSON(); // Konversi ke objek biasa
        invoiceData.lapakDetails = (invoiceData.invoice_lapak || []).map(
          (code) =>
            lapakMap.get(code) || {
              LAPAK_CODE: code,
              LAPAK_NAMA: "N/A",
              LAPAK_BLOK: "N/A",
            }
        );
        return invoiceData;
      });
    }

    return res.status(200).json({ data: rows, total: count, totalPages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.rejectConfirmation = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id: invoiceCode } = req.params;

  const logSource = {
    user: req.user,
    query: req.sqlQuery,
  };

  try {
    const invoice = await Invoices.findByPk(invoiceCode);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.invoice_status !== "waiting") {
      return res
        .status(400)
        .json({ message: "Only waiting invoices can be rejected." });
    }

    // Hapus file bukti pembayaran jika ada
    if (invoice.invoice_file) {
      fs.unlink(invoice.invoice_file, (err) => {
        if (err) {
          console.error("Failed to delete payment proof file:", err);
          // Lanjutkan proses meskipun file gagal dihapus
        }
      });
    }

    // Ubah status kembali ke pending dan hapus path file
    invoice.invoice_status = "pending";
    invoice.invoice_file = null;
    await invoice.save();

    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: invoice.invoice_code,
      LOG_DETAIL: "Payment confirmation rejected",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "reject_payment",
    });

    return res.status(200).json({ message: "Payment rejected successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  const userId = req.user.id;
  const invoiceId = req.params.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const invoice = await Invoices.findByPk(invoiceId);
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceStatusByCode = async (req, res) => {
  const code = req.params.code;

  try {
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: code },
      include: [
        {
          model: DB_LAPAK,
          as: "lapaks",
        },
        {
          model: data_pasar,
          as: "pasar",
        },
      ],
    });

    if (!pedagang) {
      return res.status(404).json({ message: "Pedagang not found" });
    }

    const invoice = await Invoices.findOne({
      where: {
        invoice_pedagang: pedagang.CUST_CODE,
        invoice_status: { [Sequelize.Op.in]: ["pending", "paid", "waiting"] },
      },
      order: [["invoice_date", "DESC"]],
    });

    if (!invoice) {
      return res.status(200).json({
        message: `Tidak ada tagihan yang perlu dibayar untuk pedagang "${pedagang.CUST_NAMA}".`,
      });
    }

    if (invoice.invoice_status === "waiting") {
      return res
        .status(200)
        .json({ message: "Invoice sedang menunggu konfirmasi" });
    }

    if (invoice.invoice_status === "paid") {
      return res.status(200).json({ message: "Invoice sudah terbayar" });
    }

    // Jika status 'pending'
    return res.status(200).json({
      pedagang: pedagang,
      invoice: invoice,
      lapaks: pedagang.lapaks,
      pasar: pedagang.pasar,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

exports.updateStatusInvoice = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id: invoiceCode } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const logSource = {
    user: req.user,
    query: req.sqlQuery,
  };

  try {
    const invoice = await Invoices.findByPk(invoiceCode);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.invoice_status = status;

    await invoice.save();

    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: invoice.invoice_code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });

    return res.status(200).json(invoice);
  } catch (error) {
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: invoiceCode,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(500).json({ error: error.message });
  }
};

exports.sendConfirmationPayment = async (req, res) => {
  const { cust_code } = req.body;
  const buktiFoto = req.files.bukti_foto ? req.files.bukti_foto[0] : null;

  if (!cust_code || !buktiFoto) {
    return res
      .status(400)
      .json({ message: "Customer code and payment proof are required." });
  }

  try {
    // 1. Find pedagang by CUST_CODE
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: cust_code },
    });
    if (!pedagang) {
      return res.status(404).json({ message: "Pedagang not found." });
    }

    // 2. Find the latest pending invoice for that pedagang
    const invoice = await Invoices.findOne({
      where: {
        invoice_pedagang: pedagang.CUST_CODE,
        invoice_status: "pending",
      },
      order: [["invoice_date", "DESC"]],
    });

    if (!invoice) {
      return res.status(404).json({ message: "No pending invoice found." });
    }

    // 3. Update invoice status and file path
    invoice.invoice_status = "waiting";
    invoice.invoice_file = buktiFoto.path; // Save the file path
    await invoice.save();

    return res.status(200).json({
      message:
        "Payment confirmation sent successfully. Please wait for verification.",
    });
  } catch (error) {
    console.error("Error sending payment confirmation:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.searchPedagangForConfirmation = async (req, res) => {
  const { search, pasar_code } = req.query;

  // Pastikan pasar sudah dipilih dan panjang pencarian memadai
  if (!pasar_code || !search || search.length < 3) {
    return res.status(200).json([]);
  }

  try {
    // 1. Cari pedagang berdasarkan NAMA
    const pedagangWhere = {
      CUST_NAMA: { [Op.like]: `%${search}%` },
      CUST_STATUS: "aktif",
      CUST_OWNER: pasar_code,
    };

    const pedagangByName = await DB_PEDAGANG.findAll({
      where: pedagangWhere,
      attributes: ["CUST_CODE"],
    });

    // 2. Cari pedagang berdasarkan BLOK LAPAK
    const lapakWhere = {
      LAPAK_NAMA: { [Op.like]: `%${search}%` },
      LAPAK_PENYEWA: { [Op.ne]: null }, // Pastikan ada penyewanya
      LAPAK_OWNER: pasar_code,
    };

    const lapaksByBlok = await DB_LAPAK.findAll({
      where: lapakWhere,
      attributes: ["LAPAK_PENYEWA"],
    });

    // 3. Gabungkan CUST_CODE dari kedua hasil pencarian dan buat unik
    const pedagangCodesByName = pedagangByName.map((p) => p.CUST_CODE);
    const pedagangCodesByLapak = lapaksByBlok.map((l) => l.LAPAK_PENYEWA);
    const uniquePedagangCodes = [
      ...new Set([...pedagangCodesByName, ...pedagangCodesByLapak]),
    ];

    if (uniquePedagangCodes.length === 0) {
      return res.status(200).json([]);
    }

    // 4. Ambil data lengkap pedagang berdasarkan CUST_CODE yang unik
    const pedagangs = await DB_PEDAGANG.findAll({
      where: {
        CUST_CODE: { [Op.in]: uniquePedagangCodes },
      },
      include: [
        {
          model: DB_LAPAK,
          as: "lapaks",
          attributes: ["LAPAK_NAMA", "LAPAK_BLOK"],
        },
      ],
      limit: 10, // Batasi hasil untuk performa
    });

    return res.status(200).json(pedagangs);
  } catch (error) {
    console.error("Error searching pedagang for confirmation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
