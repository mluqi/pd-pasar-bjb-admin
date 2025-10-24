const { Op, Sequelize, where } = require("sequelize");
const { user_level, userakses, data_pasar } = require("../models");
const { addLogActivity } = require("./logController");

exports.getAllUsers = async (req, res) => {
  const userId = req.user.id;
  const user_level = req.user.level;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user_level !== "SUA") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const pasar = req.query.pasar || "";
  const offset = (page - 1) * limit;

  try {
    const whereClause = {
      [Op.and]: [
        search
          ? {
              [Op.or]: [
                { user_name: { [Op.like]: `%${search}%` } },
                { user_email: { [Op.like]: `%${search}%` } },
                { user_phone: { [Op.like]: `%${search}%` } },
              ],
            }
          : {},
        status ? { user_status: status } : {},
        pasar ? { user_owner: pasar } : {},
      ],
    };

    const { count, rows } = await userakses.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["user_name", "ASC"]],
      attributes: {
        exclude: ["user_pass", "user_validation"],
      },
      include: [
        {
          model: data_pasar,
          as: "pasar",
          attributes: ["pasar_nama", "pasar_code"],
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
    console.log(error);
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

exports.editUser = async (req, res) => {
  const { user_code } = req.params;
  const userId = req.user.id;
  const userOwner = req.user.owner;
  const user_level = req.user.level;

  if (user_level !== "SUA") {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await userakses.findOne({
      where: { user_code },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const {
      user_name,
      user_phone,
      user_email,
      user_level,
      user_status,
      user_owner,
    } = req.body;

    if (req.file) {
      const fs = require("fs");
      const path = require("path");

      if (user.user_foto) {
        const oldPhotoPath = path.join(
          __dirname,
          "../../uploads",
          user.user_foto
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      user.user_foto = req.file.filename;
    }

    user.user_name = user_name || user.user_name;
    user.user_phone = user_phone || user.user_phone;
    user.user_email = user_email || user.user_email;
    user.user_level = user_level || user.user_level;
    user.user_status = user_status || user.user_status;
    user.user_owner = user_owner || user.user_owner;

    await user.save({
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: null,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: userOwner,
      LOG_ACTION: "update",
    });
    return res.status(200).json({
      message: "Berhasil memperbarui data pengguna.",
      data: user,
    });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: user_code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: userOwner || "unknown",
      LOG_ACTION: "update",
    });
    return res.status(500).json({
      message: "Internal server error during user update.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { user_code } = req.params;
  const userId = req.user.id;
  const userOwner = req.user.owner;
  const user_level = req.user.level;

  if (user_level !== "SUA") {
    res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await userakses.findOne({
      where: { user_code },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
    }

    const fs = require("fs");
    const path = require("path");

    if (user.user_foto) {
      const filePath = path.join(__dirname, "../../uploads", user.user_foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await user.destroy({
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: user_code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: userOwner,
      LOG_ACTION: "delete",
    });
    return res.status(200).json({ message: "User removed" });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: userId,
      LOG_TARGET: user_code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"),
      LOG_OWNER: userOwner,
      LOG_ACTION: "delete",
    });
    return res.status(500).json({
      message: error.message,
    });
  }
};
