const { LOG_ACTIVITY, LOG_AKSES, Sequelize } = require("../models");
const { Op } = require("sequelize"); // Add the missing import for Op

exports.getAllLogActivity = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const action = req.query.action || "";
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  let endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  const offset = (page - 1) * limit;

  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }

  try {
    const whereClause = [
      {
        [Sequelize.Op.or]: [
          { LOG_TARGET: { [Op.like]: `%${search}%` } },
          { LOG_USER: { [Op.like]: `%${search}%` } },
          { LOG_OWNER: { [Op.like]: `%${search}%` } },
        ],
      },
      status ? { LOG_DETAIL: status } : {},
      action ? { LOG_ACTION: action } : {},
      startDate ? { LOG_RECORD: { [Op.gte]: startDate } } : {},
      endDate ? { LOG_RECORD: { [Op.lte]: endDate } } : {},
    ];

    const { count, rows } = await LOG_ACTIVITY.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["LOG_RECORD", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch log activity:", error);
    res.status(500).json({ message: "Failed to fetch log activity." });
  }
};

exports.getAllLogAkses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const browser = req.query.browser || "";
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  let endDate = req.query.endDate ? new Date(req.query.endDate) : null;
  const offset = (page - 1) * limit;

  if (startDate) {
    startDate.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }

  try {
    const whereClause = [
      {
        [Sequelize.Op.or]: [
          { AKSES_USER: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      },
      status ? { AKSES_STATUS: status } : {},
      browser ? { AKSES_BROWSER: browser } : {},
      startDate ? { AKSES_RECORD: { [Op.gte]: startDate } } : {},
      endDate ? { AKSES_RECORD: { [Op.lte]: endDate } } : {},
    ];

    const { count, rows } = await LOG_AKSES.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["AKSES_RECORD", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Failed to fetch log status:", error);
    res.status(500).json({ message: "Failed to fetch log status." });
  }
};

exports.addLogActivity = async (logData) => {
  try {
    const {
      LOG_USER,
      LOG_TARGET,
      LOG_DETAIL,
      LOG_SOURCE,
      LOG_OWNER,
      LOG_ACTION,
    } = logData;

    const LOG_RECORD = new Date();

    const log = await LOG_ACTIVITY.create({
      LOG_USER,
      LOG_TARGET,
      LOG_DETAIL,
      LOG_SOURCE,
      LOG_RECORD,
      LOG_OWNER,
      LOG_ACTION,
    });

    return log;
  } catch (error) {
    console.error("Gagal menambahkan log aktivitas:", error);
    throw error;
  }
};

exports.addLogAkses = async (logData) => {
  try {
    const {
      AKSES_USER = 'Unknown',
      AKSES_IP = 'Unknown IP',
      AKSES_BROWSER = 'Unknown Browser',
      AKSES_STATUS = 'Unknown Status',
    } = logData;

    const AKSES_RECORD = new Date();

    const log = await LOG_AKSES.create({
      AKSES_USER,
      AKSES_IP,
      AKSES_BROWSER,
      AKSES_STATUS,
      AKSES_RECORD,
    });

    return log;
  } catch (error) {
    console.error("Gagal menambahkan log akses:", error.message);
    throw error;
  }
};
