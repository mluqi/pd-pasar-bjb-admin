const { DB_PEDAGANG, DB_LAPAK, data_pasar, DB_IURAN } = require("../models");
const { Sequelize } = require("sequelize");
const { addLogActivity } = require("./logController");
const Joi = require("joi");

const pedagangSchema = Joi.object({
  CUST_NAMA: Joi.string().min(3).max(100).required(),
  CUST_NIK: Joi.string().length(16).required(),
  CUST_PHONE: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  CUST_IURAN: Joi.string().required(),
});

exports.getAllPedagang = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const owner = req.query.owner || "";
  const status = req.query.status || "";
  const offset = (page - 1) * limit;

  try {
    const whereConditions = [
      {
        [Sequelize.Op.or]: [
          { CUST_NAMA: { [Sequelize.Op.like]: `%${search}%` } },
          { CUST_NIK: { [Sequelize.Op.like]: `%${search}%` } },
          { CUST_PHONE: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      },
      status ? { CUST_STATUS: status } : {},
      owner ? { CUST_OWNER: owner } : {},
    ];

    // Tambahan: Jika level bukan SUA, batasi berdasarkan pasar pengguna
    if (userLevel !== "SUA") {
      whereConditions.push({ CUST_OWNER: userPasar });
    }

    const whereClause = {
      [Sequelize.Op.and]: whereConditions,
    };

    const { count, rows } = await DB_PEDAGANG.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["CUST_NAMA", "ASC"]],
      include: [
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_code"],
        },
        {
          model: DB_LAPAK,
          as: "lapaks",
          attributes: [
            "LAPAK_CODE",
            "LAPAK_NAMA",
            "LAPAK_MULAI",
            "LAPAK_AKHIR",
          ],
        },
      ],
    });

    return res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch pedagang:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPedagangWithoutPagination = async (req, res) => {
  const userId = req.user.id;
  const userlevel = req.user.level;
  const userPasar = req.user.owner;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = userlevel !== "SUA" ? { CUST_OWNER: userPasar } : {};

    const pedagangs = await DB_PEDAGANG.findAll({
      attributes: ["CUST_CODE", "CUST_NAMA"],
      where: whereClause,
      order: [["CUST_NAMA", "ASC"]],
    });

    res.status(200).json(pedagangs);
  } catch (error) {
    console.error("Failed to fetch all pedagangs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPedagangById = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const iuranPage = parseInt(req.query.iuranPage) || 1;
  const iuranLimit = parseInt(req.query.iuranLimit) || 10;
  const iuranOffset = (iuranPage - 1) * iuranLimit;

  try {
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: req.params.code },
      include: [
        { model: DB_LAPAK, as: "lapaks" },
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_code"],
        },
      ],
    });

    if (!pedagang)
      return res.status(404).json({ message: "Pedagang not found" });

    const iuranData = await DB_IURAN.findAndCountAll({
      where: { IURAN_PEDAGANG: req.params.code },
      limit: iuranLimit,
      offset: iuranOffset,
      order: [["IURAN_TANGGAL", "DESC"]]
    });

    res.json({
      pedagang: pedagang,
      iurans: {
        data: iuranData.rows,
        total: iuranData.count,
        page: iuranPage,
        totalPages: Math.ceil(iuranData.count / iuranLimit),
      },
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPedagang = async (req, res) => {
  const userId = req.user.id;
  const pasarCode = req.user.owner;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!pasarCode) {
    return res.status(400).json({ message: "Pasar code is required" });
  }

  const CUST_OWNER = pasarCode;
  const { CUST_NAMA, CUST_NIK, CUST_PHONE, CUST_IURAN } = req.body;

  const { error } = pedagangSchema.validate({
    CUST_NAMA,
    CUST_NIK,
    CUST_PHONE,
    CUST_IURAN,
  });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const transaction = await DB_PEDAGANG.sequelize.transaction();

  try {
    const existingPedagang = await DB_PEDAGANG.findOne({
      where: {
        [Sequelize.Op.or]: [{ CUST_NIK }, { CUST_PHONE }],
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingPedagang) {
      await transaction.rollback();
      return res.status(400).json({ message: "Pedagang already exists" });
    }

    // Ambil kode terakhir dengan lock
    const lastPedagang = await DB_PEDAGANG.findOne({
      order: [["CUST_CODE", "DESC"]],
      transaction,
      lock: transaction.LOCK.UPDATE, // Kunci row terakhir
    });

    const lastCode = lastPedagang ? lastPedagang.CUST_CODE : "CUST00000";
    const lastCodeNumber = parseInt(lastCode.replace("CUST", ""));
    const newCodeNumber = lastCodeNumber + 1;
    const CUST_CODE = `CUST${String(newCodeNumber).padStart(5, "0")}`;

    const newPedagang = await DB_PEDAGANG.create(
      {
        CUST_CODE,
        CUST_NAMA,
        CUST_NIK,
        CUST_PHONE,
        CUST_OWNER,
        CUST_IURAN,
        CUST_STATUS: "aktif",
      },
      {
        transaction,
        logging: (query) => {
          req.sqlQuery = query;
        },
      }
    );

    await transaction.commit();

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: CUST_CODE,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });

    return res.status(201).json(newPedagang);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await transaction.rollback();

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });

    return res.status(500).json({ error: error.message });
  }
};

exports.updatePedagang = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const [updated] = await DB_PEDAGANG.update(req.body, {
      where: { CUST_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!updated) {
      res.status(404).json({ message: "Pedagang not found" });
    }

    const updatedPedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: req.params.code },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(200).json(updatedPedagang);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });

    return res.status(400).json({ error: error.message });
  }
};

exports.deletePedagang = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const deleted = await DB_PEDAGANG.destroy({
      where: { CUST_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });
    if (!deleted) {
      res.status(404).json({ message: "Pedagang not found" });
    }

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });

    return res.status(200).json({ message: "Pedagang deleted" });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(200).status(500).json({ error: error.message });
  }
};
