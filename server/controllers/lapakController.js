const {
  DB_LAPAK,
  DB_PEDAGANG,
  data_pasar,
  DB_TYPE_LAPAK,
  DB_IURAN,
} = require("../models");
const { Op, where } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { addLogActivity } = require("./logController");

exports.getAllLapak = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const pasar = req.query.pasar || "";
  const owner = req.query.owner || "";
  const sortOrder = req.query.sortOrder || "desc";
  const offset = (page - 1) * limit;

  try {
    const whereClause = {
      [Op.and]: [
        search
          ? {
              [Op.or]: [
                { LAPAK_CODE: { [Op.like]: `%${search}%` } },
                { LAPAK_NAMA: { [Op.like]: `%${search}%` } },
              ],
            }
          : {},
        status ? { LAPAK_STATUS: status } : {},
        pasar ? { LAPAK_OWNER: pasar } : {},
        owner ? { LAPAK_PENYEWA: owner } : {},
        userLevel !== "SUA" ? { LAPAK_OWNER: userPasar } : {}, // <--- filter berdasarkan pasar user jika bukan SUA
      ],
    };

    const { count, rows } = await DB_LAPAK.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["LAPAK_CODE", sortOrder]],
      include: [
        { model: data_pasar, as: "pasar", attributes: ["pasar_nama"] },
        { model: DB_PEDAGANG, attributes: ["CUST_CODE", "CUST_NAMA"] },
        { model: DB_TYPE_LAPAK, attributes: ["TYPE_CODE", "TYPE_NAMA"] },
      ],
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch lapaks:", error);
    res.status(500).json({ message: "Failed to fetch lapaks." });
  }
};

exports.getAllLapakWithoutPagination = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const forPedagangCode = req.query.pedagangCode || null; // Parameter untuk pedagang spesifik

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereConditions = [];
    if (userLevel !== "SUA") {
      whereConditions.push({ LAPAK_OWNER: userPasar });
    }

    if (forPedagangCode) {
      whereConditions.push({
        [Op.or]: [
          { LAPAK_STATUS: "kosong" },
          { LAPAK_PENYEWA: forPedagangCode },
        ],
      });
    } else {
      // Jika menambah baru, hanya tampilkan lapak kosong
      whereConditions.push({ LAPAK_STATUS: "kosong" });
    }

    const lapaks = await DB_LAPAK.findAll({
      where: { [Op.and]: whereConditions },
      attributes: ["LAPAK_CODE", "LAPAK_NAMA", "LAPAK_OWNER"],
      order: [["LAPAK_NAMA", "ASC"]],
    });

    res.status(200).json(lapaks);
  } catch (error) {
    console.error("Failed to fetch all lapaks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLapakByCode = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        { LAPAK_CODE: req.params.code },
        userLevel !== "SUA" ? { LAPAK_OWNER: userPasar } : {},
      ],
    };

    const lapak = await DB_LAPAK.findOne({
      where: whereClause,
      include: [
        {
          model: DB_PEDAGANG,
          include: [
            {
              model: DB_IURAN,
              as: "iurans",
              where: { IURAN_STATUS: ["pending", "tidak berjualan"] },
              required: false,
            },
          ],
        },
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_code"],
        },
      ],
    });
    if (!lapak) {
      res.status(404).json({ message: "Lapak not found" });
    }
    res.json(lapak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLapak = async (req, res) => {
  const userId = req.user.id;
  const pasarCode = req.user.owner;
  const userLevel = req.user.level;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }
  if (!pasarCode) {
    res.status(400).json({ message: "Pasar code is required" });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is empty or invalid" });
  }

  const {
    LAPAK_NAMA,
    LAPAK_BLOK,
    LAPAK_UKURAN,
    LAPAK_TYPE,
    LAPAK_STATUS,
    LAPAK_PENYEWA,
    // LAPAK_MULAI
    // LAPAK_AKHIR,
    LAPAK_OWNER,
    LAPAK_HEREGISTRASI,
    LAPAK_SIPTU,
  } = req.body;

  const currentDate = new Date();
  const defaultMulai = new Date(currentDate);
  defaultMulai.setHours(0, 0, 0, 0);
  const defaultAkhir = new Date(currentDate);
  defaultAkhir.setFullYear(defaultAkhir.getFullYear() + 20);
  defaultAkhir.setHours(23, 59, 59, 999);

  // Set default values if not provided
  const LAPAK_MULAI = defaultMulai;
  const LAPAK_AKHIR = defaultAkhir;

  if (
    !LAPAK_NAMA ||
    !LAPAK_BLOK ||
    !LAPAK_UKURAN ||
    !LAPAK_TYPE ||
    !LAPAK_STATUS
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let finalLapakOwner;

  if (userLevel === "SUA") {
    finalLapakOwner = LAPAK_OWNER || pasarCode;
  } else {
    finalLapakOwner = pasarCode;
  }

  const existingLapak = await DB_LAPAK.findOne({
    where: { LAPAK_NAMA, LAPAK_BLOK, LAPAK_UKURAN, LAPAK_TYPE },
  });
  if (existingLapak) {
    res.status(400).json({ message: "Lapak already exists" });
  }

  const prefix = "LAP";
  const lastLapak = await DB_LAPAK.findOne({
    where: { LAPAK_OWNER: finalLapakOwner },
    order: [["LAPAK_CODE", "DESC"]],
  });
  const lastLapakCode = lastLapak ? lastLapak.LAPAK_CODE : null;
  const lastLapakNumber = lastLapakCode ? parseInt(lastLapakCode.slice(-3)) : 0;
  const newLapakNumber = lastLapakNumber + 1;
  const lapakCode = `${LAPAK_OWNER}${prefix}${String(newLapakNumber).padStart(
    3,
    "0"
  )}`;

  const lapakCodeExists = await DB_LAPAK.findOne({
    where: { LAPAK_CODE: lapakCode },
  });
  if (lapakCodeExists) {
    res.status(400).json({ message: "Lapak code already exists" });
  }

  let lapakBuktiFotoPath = null;
  if (req.file) {
    lapakBuktiFotoPath = req.file.path;
  }

  if (LAPAK_STATUS === "tutup" && !lapakBuktiFotoPath) {
    return res.status(400).json({
      message: "Bukti foto wajib diunggah jika status lapak adalah tutup.",
    });
  }

  try {
    const newLapak = await DB_LAPAK.create(
      {
        LAPAK_CODE: lapakCode,
        LAPAK_NAMA,
        LAPAK_BLOK,
        LAPAK_UKURAN,
        LAPAK_TYPE,
        LAPAK_PENYEWA: LAPAK_PENYEWA === "" ? null : LAPAK_PENYEWA,
        LAPAK_MULAI: LAPAK_MULAI === "" ? null : LAPAK_MULAI,
        LAPAK_AKHIR: LAPAK_AKHIR === "" ? null : LAPAK_AKHIR,
        LAPAK_STATUS,
        LAPAK_OWNER: finalLapakOwner,
        LAPAK_BUKTI_FOTO: LAPAK_STATUS === "tutup" ? lapakBuktiFotoPath : null,
        LAPAK_HEREGISTRASI: LAPAK_HEREGISTRASI || null,
        LAPAK_SIPTU: LAPAK_SIPTU || null,
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
      LOG_TARGET: lapakCode,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    return res.status(201).json(newLapak);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    return res.status(500).json({ error: error.message });
  }
};

const deleteFileIfExists = (filePath) => {
  if (filePath) {
    const fullPath = path.resolve(filePath); // Ensure absolute path
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        // ENOENT means file not found, which is fine
        console.error("Failed to delete old bukti foto:", err);
      }
    });
  }
};

exports.updateLapak = async (req, res) => {
  try {
    const lapakCode = req.params.code;
    const currentLapak = await DB_LAPAK.findByPk(lapakCode);

    if (!currentLapak) {
      return res.status(404).json({ message: "Lapak not found" });
    }

    const updatePayload = { ...req.body };
    const oldPhotoPath = currentLapak.LAPAK_BUKTI_FOTO;

    // Handle file upload
    if (req.file) {
      updatePayload.LAPAK_BUKTI_FOTO = req.file.path;
    }

    const finalStatus = updatePayload.LAPAK_STATUS || currentLapak.LAPAK_STATUS;
    let finalBuktiFoto = updatePayload.LAPAK_BUKTI_FOTO; // Path of new file if uploaded

    if (!req.file) {
      if (
        updatePayload.hasOwnProperty("LAPAK_BUKTI_FOTO") &&
        updatePayload.LAPAK_BUKTI_FOTO === null
      ) {
        finalBuktiFoto = null;
      } else if (
        updatePayload.hasOwnProperty("LAPAK_BUKTI_FOTO") &&
        updatePayload.LAPAK_BUKTI_FOTO === ""
      ) {
        // Sent as empty string from frontend
        finalBuktiFoto = null;
      } else if (
        !updatePayload.hasOwnProperty("LAPAK_BUKTI_FOTO") ||
        updatePayload.LAPAK_BUKTI_FOTO === undefined
      ) {
        finalBuktiFoto = currentLapak.LAPAK_BUKTI_FOTO; // Keep existing if not in payload
      }
    }

    if (finalStatus === "tutup") {
      if (!finalBuktiFoto) {
        return res.status(400).json({
          message: "Bukti foto wajib ada jika status lapak adalah tutup.",
        });
      }
      updatePayload.LAPAK_BUKTI_FOTO = finalBuktiFoto;
    } else {
      updatePayload.LAPAK_BUKTI_FOTO = null; // Clear photo if status is not "tutup"
    }

    ["LAPAK_PENYEWA", "LAPAK_MULAI", "LAPAK_AKHIR"].forEach((key) => {
      if (updatePayload.hasOwnProperty(key) && updatePayload[key] === "") {
        updatePayload[key] = null;
      }
    });

    const [updated] = await DB_LAPAK.update(updatePayload, {
      where: { LAPAK_CODE: lapakCode },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    // Delete old photo if it's different from the new one or if it's being cleared
    if (oldPhotoPath && oldPhotoPath !== updatePayload.LAPAK_BUKTI_FOTO) {
      deleteFileIfExists(oldPhotoPath);
    }

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

    const updatedLapak = await DB_LAPAK.findOne({
      // Fetch the updated record to return
      where: { LAPAK_CODE: lapakCode },
    });

    return res.status(200).json(updatedLapak);
  } catch (error) {
    // Log the full error for better debugging on the server
    console.error("Error in updateLapak:", error);

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
    // Return a 500 status for internal server errors
    return res.status(500).json({
      message: "Internal server error while updating lapak.",
      error: error.message || "Unknown error", // Provide a fallback for error message
    });
  }
};

exports.updateLapakStatus = async (req, res) => {
  const { LAPAK_STATUS, LAPAK_PENYEWA, LAPAK_MULAI, LAPAK_AKHIR } = req.body;
  const lapakCode = req.params.code;
  let buktiFotoPath = null;

  if (req.file) {
    buktiFotoPath = req.file.path;
  }

  const currentLapak = await DB_LAPAK.findByPk(lapakCode);
  if (!currentLapak)
    return res.status(404).json({ message: "Lapak not found" });
  const oldPhotoPath = currentLapak.LAPAK_BUKTI_FOTO;

  try {
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: LAPAK_PENYEWA },
    });

    if (!pedagang) {
      return res.status(400).json({
        message: "Pedagang not found. Please provide a valid Pedagang name.",
      });
    }

    if (LAPAK_STATUS === "tutup" && !buktiFotoPath && !oldPhotoPath) {
      return res.status(400).json({
        message:
          "Bukti foto wajib diupload jika status lapak ingin diubah menjadi tutup.",
      });
    }

    const updateData = {
      LAPAK_STATUS,
      LAPAK_PENYEWA: pedagang.CUST_CODE,
      LAPAK_MULAI,
      LAPAK_AKHIR,
    };

    if (LAPAK_STATUS === "tutup") {
      if (buktiFotoPath) {
        updateData.LAPAK_BUKTI_FOTO = buktiFotoPath;
      } else if (oldPhotoPath) {
        updateData.LAPAK_BUKTI_FOTO = oldPhotoPath;
      }
    } else {
      updateData.LAPAK_BUKTI_FOTO = null;
    }

    const [updated] = await DB_LAPAK.update(updateData, {
      where: { LAPAK_CODE: lapakCode },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!updated) {
      res.status(404).json({ message: "Lapak not found" });
    }

    if (oldPhotoPath && oldPhotoPath !== updateData.LAPAK_BUKTI_FOTO) {
      deleteFileIfExists(oldPhotoPath);
    }

    const updatedLapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: lapakCode },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: pedagang.CUST_CODE,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });

    return res.status(201).json(updatedLapak);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLapak = async (req, res) => {
  try {
    const lapakCode = req.params.code;
    const lapakToDelete = await DB_LAPAK.findByPk(lapakCode);

    if (!lapakToDelete) {
      res.status(404).json({ message: "Lapak not found" });
    }
    const photoPathToDelete = lapakToDelete.LAPAK_BUKTI_FOTO;

    const deleted = await DB_LAPAK.destroy({
      where: { LAPAK_CODE: lapakCode },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!deleted) {
      res.status(404).json({ message: "Lapak not found" });
    }

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: lapakCode,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });

    if (photoPathToDelete) {
      deleteFileIfExists(photoPathToDelete);
    }

    return res.status(200).json({ message: "Lapak deleted" });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: lapakCode,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(500).json({ error: error.message });
  }
};
