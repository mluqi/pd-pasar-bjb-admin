const { Op, Sequelize, where } = require("sequelize");
const { user_level, userakses } = require("../models");

exports.getAllUser = async (req, res) => {
  const userId = req.user.id;
  const user_level = req.user.level;
  const pasar_code = req.user.pasar_code;

  try {
    if (user_level === "PGN") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user_level === "SUA") {
      const data = await userakses.findAll();
      return res.status(200).json(data);
    }

    if (user_level === "PTG") {
      const data = await userakses.findAll({
        where: {
          userId,
          pasar_code,
        },
        exclude: [
          "user_password",
          "user_validation"
        ],
      });

      return res.status(200).json(data);
    }
  } catch {
    res.status(500).json({ message: error.message });
  }
};

exports.editUser = async (req, res) => {
  const { user_code } = req.params;

  const user_level = req.user.level;

  if (user_level !== "SUA") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await userakses.findOne({
      where: { user_code },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

      // Hapus file gambar lama jika ada
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

    await user.save();

    return res.status(200).json({
      message: "Berhasil memperbarui data pengguna.",
      data: user,
    });
  } catch (error) {
    console.error("Edit User Error:", error);
    return res.status(500).json({
      message: "Internal server error during user update.",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { user_code } = req.params;

  const user_level = req.user.level;

  if (user_level !== "SUA") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await userakses.findOne({
      where: { user_code },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const fs = require("fs");
    const path = require("path");

    // Hapus file gambar jika ada
    if (user.user_foto) {
      const filePath = path.join(__dirname, "../../uploads", user.user_foto);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await user.destroy();
    return res.status(200).json({ message: "User removed" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};