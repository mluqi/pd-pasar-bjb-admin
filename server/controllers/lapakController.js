const {
  DB_LAPAK,
  DB_PEDAGANG,
  data_pasar,
  DB_TYPE_LAPAK,
} = require("../models");
const { Op, where } = require("sequelize");
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
      order: [["LAPAK_NAMA", "ASC"]],
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

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      LAPAK_STATUS: "kosong",
      ...(userLevel !== "SUA" && { LAPAK_OWNER: userPasar }),
    };

    const lapaks = await DB_LAPAK.findAll({
      where: whereClause,
      attributes: ["LAPAK_CODE", "LAPAK_NAMA"],
      order: [["LAPAK_NAMA", "ASC"]],
    });

    res.status(200).json(lapaks);
  } catch (error) {
    console.error("Failed to fetch all lapaks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getLapakByCode = async (req, res) => {
  try {
    const lapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: req.params.code },
      include: [
        { model: DB_PEDAGANG },
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_code"],
        },
      ],
    });
    if (!lapak) return res.status(404).json({ message: "Lapak not found" });
    res.json(lapak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLapak = async (req, res) => {
  const userId = req.user.id;
  const pasarCode = req.user.owner;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }
  if (!pasarCode) {
    res.status(400).json({ message: "Pasar code is required" });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "Request body is empty or invalid" });
  }

  const { LAPAK_NAMA, LAPAK_BLOK, LAPAK_UKURAN, LAPAK_TYPE, LAPAK_STATUS } =
    req.body;
  if (
    !LAPAK_NAMA ||
    !LAPAK_BLOK ||
    !LAPAK_UKURAN ||
    !LAPAK_TYPE ||
    !LAPAK_STATUS
  ) {
    res.status(400).json({ message: "All fields are required" });
  }
  const LAPAK_OWNER = pasarCode;
  const LAPAK_MULAI = req.body.LAPAK_MULAI || null;
  const LAPAK_AKHIR = req.body.LAPAK_AKHIR || null;
  const LAPAK_PENYEWA = req.body.LAPAK_PENYEWA || "";

  const existingLapak = await DB_LAPAK.findOne({
    where: { LAPAK_NAMA, LAPAK_BLOK, LAPAK_UKURAN, LAPAK_TYPE },
  });
  if (existingLapak) {
    res.status(400).json({ message: "Lapak already exists" });
  }

  const prefix = "LAP";
  const lastLapak = await DB_LAPAK.findOne({
    where: { LAPAK_OWNER: LAPAK_OWNER },
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

  try {
    const newLapak = await DB_LAPAK.create(
      {
        LAPAK_CODE: lapakCode,
        LAPAK_NAMA,
        LAPAK_BLOK,
        LAPAK_UKURAN,
        LAPAK_TYPE,
        LAPAK_PENYEWA,
        LAPAK_MULAI,
        LAPAK_AKHIR,
        LAPAK_STATUS,
        LAPAK_OWNER,
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

exports.updateLapak = async (req, res) => {
  try {
    const [updated] = await DB_LAPAK.update(req.body, {
      where: { LAPAK_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });
    if (!updated) {
      res.status(404).json({ message: "Lapak not found" });
    }

    const updatedLapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: req.params.code },
    });

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
    return res.status(200).json(updatedLapak);
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
    return res.status(400).json({ error: error.message });
  }
};

exports.updateLapakStatus = async (req, res) => {
  const { LAPAK_STATUS, LAPAK_PENYEWA, LAPAK_MULAI, LAPAK_AKHIR } = req.body;

  try {
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_NAMA: LAPAK_PENYEWA },
    });

    if (!pedagang) {
      res.status(404).json({ message: "Pedagang not found" });
    }

    const [updated] = await DB_LAPAK.update(
      {
        LAPAK_STATUS,
        LAPAK_PENYEWA: pedagang.CUST_CODE,
        LAPAK_MULAI,
        LAPAK_AKHIR,
      },
      {
        where: { LAPAK_CODE: req.params.code },
        logging: (query) => {
          req.sqlQuery = query;
        },
      }
    );

    if (!updated) {
      res.status(404).json({ message: "Lapak not found" });
    }

    const updatedLapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: req.params.code },
    });

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
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLapak = async (req, res) => {
  try {
    const deleted = await DB_LAPAK.destroy({
      where: { LAPAK_CODE: req.params.code },
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
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(200).json({ message: "Lapak deleted" });
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
      LOG_ACTION: "delete",
    });
    return res.status(500).json({ error: error.message });
  }
};
