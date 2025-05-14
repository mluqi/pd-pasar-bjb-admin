const { DB_IURAN, DB_PEDAGANG } = require("../models");
const { Op, Sequelize } = require("sequelize");
const { addLogActivity } = require("./logController");

exports.getAllIuran = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const metode = req.query.metode || "";
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  const offset = (page - 1) * limit;

  try {
    const whereClause = {
      [Op.and]: [
        search
          ? {
              [Op.or]: [
                { IURAN_CODE: { [Op.like]: `%${search}%` } },
                { "$DB_PEDAGANG.CUST_NAMA$": { [Op.like]: `%${search}%` } },
              ],
            }
          : {},
        status ? { IURAN_STATUS: status } : {},
        metode ? { IURAN_METODE_BAYAR: metode } : {},
        startDate ? { IURAN_TANGGAL: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_TANGGAL: { [Op.lte]: endDate } } : {},
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
      ],
    };

    const { count, rows } = await DB_IURAN.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["IURAN_TANGGAL", "DESC"]],
      include: [
        {
          model: DB_PEDAGANG,
          as: "DB_PEDAGANG",
          attributes: ["CUST_CODE", "CUST_NAMA", "CUST_OWNER"],
        },
      ],
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch iurans:", error);
    res.status(500).json({ message: "Failed to fetch iurans." });
  }
};

exports.getIuranByCode = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const iuran = await DB_IURAN.findOne({
      where: { IURAN_CODE: req.params.code },
      include: [{ model: DB_PEDAGANG, attributes: ["CUST_CODE", "CUST_NAMA"] }],
    });
    if (!iuran) return res.status(404).json({ message: "Iuran not found" });
    return res.status(200).res.json(iuran);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createIuran = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  // generate unique code example: IU20231001000001 last 5 number is sequence
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  // generate code 5 angka trakhir denagn cara cari angka 5 terakhir dan terbesar baru ditambah 1
  const lastIuran = await DB_IURAN.findOne({
    where: {
      IURAN_CODE: {
        [Op.like]: `IU${year}${month}${day}%`,
      },
    },
    order: [["IURAN_CODE", "DESC"]],
  });

  let sequenceNumber = "00001";
  if (lastIuran) {
    const lastCode = lastIuran.IURAN_CODE;
    const lastSequence = lastCode.slice(-5);
    const newSequenceNumber = parseInt(lastSequence, 10) + 1;
    sequenceNumber = newSequenceNumber.toString().padStart(5, "0");
  }

  const uniqueCode = `IU${year}${month}${day}${sequenceNumber}`;

  const existingIuran = await DB_IURAN.findOne({
    where: { IURAN_CODE: uniqueCode },
  });

  if (existingIuran) {
    res.status(400).json({ message: "Iuran code already exists" });
  }

  const { IURAN_PEDAGANG, IURAN_TANGGAL, IURAN_JUMLAH, IURAN_STATUS } =
    req.body;
  if (!IURAN_PEDAGANG || !IURAN_TANGGAL || !IURAN_JUMLAH || !IURAN_STATUS) {
    res.status(400).json({ message: "All fields are required" });
  }

  const IURAN_METODE_BAYAR = req.body.IURAN_METODE_BAYAR || "";
  const IURAN_WAKTU_BAYAR = req.body.IURAN_WAKTU_BAYAR || null;

  const newIuranTanggal = IURAN_TANGGAL ? new Date(IURAN_TANGGAL) : new Date();
  const IURAN_USER = userId;

  try {
    const newIuran = await DB_IURAN.create(
      {
        IURAN_CODE: uniqueCode,
        IURAN_PEDAGANG,
        IURAN_TANGGAL: newIuranTanggal,
        IURAN_JUMLAH,
        IURAN_STATUS,
        IURAN_METODE_BAYAR,
        IURAN_WAKTU_BAYAR,
        IURAN_USER,
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
      LOG_TARGET: uniqueCode,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    return res.status(201).json(newIuran);
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
      LOG_ACTION: "create",
    });
    return res.status(400).json({ error: error.message });
  }
};

exports.updateIuran = async (req, res) => {
  try {
    const userId = req.user.id;

    let waktuBayar = req.body.IURAN_WAKTU_BAYAR;
    if (waktuBayar) {
      const parsedDate = new Date(waktuBayar);

      if (!isNaN(parsedDate.getTime())) {
        const currentTime = new Date();
        parsedDate.setHours(currentTime.getHours());
        parsedDate.setMinutes(currentTime.getMinutes());
        parsedDate.setSeconds(currentTime.getSeconds());
        parsedDate.setMilliseconds(currentTime.getMilliseconds());
        waktuBayar = parsedDate.toISOString();
      } else {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    const updateData = {
      ...req.body,
      IURAN_WAKTU_BAYAR: waktuBayar || null,
      IURAN_USER: userId,
    };

    const [updated] = await DB_IURAN.update(updateData, {
      where: { IURAN_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!updated) {
      res.status(404).json({ message: "Iuran not found" });
    }

    const updatedIuran = await DB_IURAN.findOne({
      where: { IURAN_CODE: req.params.code },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.pasar_code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(201).json(updatedIuran);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.pasar_code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteIuran = async (req, res) => {
  try {
    const deleted = await DB_IURAN.destroy({
      where: { IURAN_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!deleted) {
      res.status(404).json({ message: "Iuran not found" });
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
    return res.status(200).json({ message: "Iuran deleted" });
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

exports.getMetodeBayarCount = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };
    const metodeBayarCounts = await DB_IURAN.findAll({
      where: whereClause,
      order: [["IURAN_METODE_BAYAR", "ASC"]],
      include:
        userLevel !== "SUA"
          ? [
              {
                model: DB_PEDAGANG,
                as: "DB_PEDAGANG",
                attributes: [],
                required: true,
              },
            ]
          : [],
      attributes: [
        "IURAN_METODE_BAYAR",
        [Sequelize.fn("COUNT", Sequelize.col("IURAN_METODE_BAYAR")), "count"],
      ],
      group: ["IURAN_METODE_BAYAR"],
    });

    res.status(200).json(metodeBayarCounts);
  } catch (error) {
    console.error("Failed to fetch metode bayar counts:", error);
    res.status(500).json({ error: "Failed to fetch metode bayar counts." });
  }
};

exports.getDataRecentTransactions = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  const limit = parseInt(req.query.limit) || 5;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };

    const recentTransactions = await DB_IURAN.findAll({
      where: whereClause,
      attributes: [
        "IURAN_CODE",
        "IURAN_JUMLAH",
        "IURAN_METODE_BAYAR",
        "IURAN_WAKTU_BAYAR",
        "IURAN_STATUS",
      ],
      limit,
      order: [["IURAN_WAKTU_BAYAR", "DESC"]],
      include: [
        {
          model: DB_PEDAGANG,
          as: "DB_PEDAGANG",
          attributes: ["CUST_NAMA"],
        },
      ],
    });

    res.status(200).json(recentTransactions);
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions." });
  }
};

exports.getTotalTransactions = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };

    const totalTransactions = await DB_IURAN.count({
      where: whereClause,
      include:
        userLevel !== "SUA"
          ? [
              {
                model: DB_PEDAGANG,
                as: "DB_PEDAGANG",
                attributes: [],
                required: true,
              },
            ]
          : [],
    });

    res.status(200).json({ totalTransactions });
  } catch (error) {
    console.error("Failed to fetch total transactions:", error);
    res.status(500).json({ error: "Failed to fetch total transactions." });
  }
};

exports.getTotalIncome = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };

    const totalIncome = await DB_IURAN.sum("IURAN_JUMLAH", {
      where: whereClause,
      include:
        userLevel !== "SUA"
          ? [
              {
                model: DB_PEDAGANG,
                as: "DB_PEDAGANG",
                attributes: [],
                required: true,
              },
            ]
          : [],
    });

    res.status(200).json({ totalIncome });
  } catch (error) {
    console.error("Failed to fetch total income:", error);
    res.status(500).json({ error: "Failed to fetch total income." });
  }
};

exports.getDataNonTunai = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_METODE_BAYAR: ["transfer", "qris"] },
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };

    const nonTunaiTransactions = await DB_IURAN.count({
      where: whereClause,
      include:
        userLevel !== "SUA"
          ? [
              {
                model: DB_PEDAGANG,
                as: "DB_PEDAGANG",
                attributes: [],
                required: true,
              },
            ]
          : [],
    });

    res.status(200).json({ nonTunaiTransactions });
  } catch (error) {
    console.error("Failed to fetch non-tunai transactions:", error);
    res.status(500).json({ error: "Failed to fetch non-tunai transactions." });
  }
};

exports.getDataTunai = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const whereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_METODE_BAYAR: "cash" },
        { IURAN_STATUS: "paid" },
        startDate ? { IURAN_WAKTU_BAYAR: { [Op.gte]: startDate } } : {},
        endDate ? { IURAN_WAKTU_BAYAR: { [Op.lte]: endDate } } : {},
      ],
    };

    const tunaiTransactions = await DB_IURAN.count({
      where: whereClause,
      include:
        userLevel !== "SUA"
          ? [
              {
                model: DB_PEDAGANG,
                as: "DB_PEDAGANG",
                attributes: [],
                required: true,
              },
            ]
          : [],
    });

    res.status(200).json({ tunaiTransactions });
  } catch (error) {
    console.error("Failed to fetch tunai transactions:", error);
    res.status(500).json({ error: "Failed to fetch tunai transactions." });
  }
};

exports.getDailyTransactionStats = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    let { startDate, endDate } = req.query;

    // Default to last 30 days if no date range is provided
    if (!startDate || !endDate) {
      const today = new Date();
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // Last 30 days including today

      // Format to YYYY-MM-DD for consistency if needed by query, though Sequelize handles Date objects
      // endDate = endDate.toISOString().split('T')[0];
      // startDate = startDate.toISOString().split('T')[0];
    } else {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
    }

    // Ensure endDate includes the whole day
    endDate.setHours(23, 59, 59, 999);
    startDate.setHours(0, 0, 0, 0);

    const baseWhereClause = {
      [Op.and]: [
        userLevel !== "SUA" ? { "$DB_PEDAGANG.CUST_OWNER$": userPasar } : {},
        { IURAN_STATUS: "paid" },
        { IURAN_WAKTU_BAYAR: { [Op.between]: [startDate, endDate] } },
      ],
    };

    const includeClause =
      userLevel !== "SUA"
        ? [
            {
              model: DB_PEDAGANG,
              as: "DB_PEDAGANG",
              attributes: [],
              required: true,
            },
          ]
        : [];

    const transactions = await DB_IURAN.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("IURAN_WAKTU_BAYAR")), "day"],
        "IURAN_METODE_BAYAR",
        [Sequelize.fn("SUM", Sequelize.col("IURAN_JUMLAH")), "total_amount"],
      ],
      where: baseWhereClause,
      include: includeClause,
      group: [
        Sequelize.fn("DATE", Sequelize.col("IURAN_WAKTU_BAYAR")),
        "IURAN_METODE_BAYAR",
      ],
      order: [
        [Sequelize.fn("DATE", Sequelize.col("IURAN_WAKTU_BAYAR")), "ASC"],
      ],
      raw: true,
    });

    const statsByDate = {};
    const dateCursor = new Date(startDate);
    while (dateCursor <= endDate) {
      const dateString = dateCursor.toISOString().split("T")[0];
      statsByDate[dateString] = { tunai: 0, nonTunai: 0 };
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    transactions.forEach((t) => {
      const dateString = t.day;
      if (statsByDate[dateString]) {
        if (t.IURAN_METODE_BAYAR === "cash") {
          statsByDate[dateString].tunai += parseFloat(t.total_amount);
        } else if (["transfer", "qris"].includes(t.IURAN_METODE_BAYAR)) {
          statsByDate[dateString].nonTunai += parseFloat(t.total_amount);
        }
      }
    });

    const dates = Object.keys(statsByDate).map((d) =>
      new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      })
    );
    const tunaiData = Object.values(statsByDate).map((s) => s.tunai);
    const nonTunaiData = Object.values(statsByDate).map((s) => s.nonTunai);

    res.status(200).json({ dates, tunaiData, nonTunaiData });
  } catch (error) {
    console.error("Failed to fetch daily transaction stats:", error);
    res.status(500).json({ error: "Failed to fetch daily transaction stats." });
  }
};

exports.getIuranStatusCounts = async (req, res) => {
  const userId = req.user.id;
  const userLevel = req.user.level;
  const userPasar = req.user.owner;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const conditions = [];

    if (userLevel !== "SUA") {
      conditions.push({ "$DB_PEDAGANG.CUST_OWNER$": userPasar });
    }

    if (startDate) {
      conditions.push({ IURAN_TANGGAL: { [Op.gte]: startDate } });
    }
    if (endDate) {

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push({ IURAN_TANGGAL: { [Op.lte]: endOfDay } });
    }

    const whereClause = { [Op.and]: conditions };

    const includeClause =
      userLevel !== "SUA"
        ? [{ model: DB_PEDAGANG, as: "DB_PEDAGANG", attributes: [], required: true }]
        : [];

    const statusCounts = await DB_IURAN.findAll({
      where: whereClause,
      include: includeClause,
      attributes: [
        "IURAN_STATUS",
        [Sequelize.fn("COUNT", Sequelize.col("IURAN_STATUS")), "count"],
      ],
      group: ["IURAN_STATUS"],
      order: [["IURAN_STATUS", "ASC"]],
    });
    res.status(200).json(statusCounts);
  } catch (error) {
    console.error("Failed to fetch iuran status counts:", error);
    res.status(500).json({ error: "Failed to fetch iuran status counts." });
  }
};