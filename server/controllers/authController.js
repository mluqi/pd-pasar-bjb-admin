const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userakses, user_level, data_pasar } = require("../models");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
  if (!req.user || !req.user.id || !req.user.level) {
    return res
      .status(401)
      .json({ message: "Otentikasi diperlukan untuk tindakan ini." });
  }
  const creatorId = req.user.id;
  const creatorLevel = req.user.level;

  try {
    const {
      user_name,
      user_pass,
      user_phone,
      user_email,
      user_level_name,
      user_status,
      pasar_code,
    } = req.body;

    if (
      !user_name ||
      !user_pass ||
      !user_phone ||
      !user_email ||
      !user_level_name ||
      !user_status
    ) {
      return res.status(400).json({
        message:
          "Data tidak lengkap (nama, pass, phone, email, level_name, status diperlukan).",
      });
    }

    if (!user_email.includes("@")) {
      return res.status(400).json({
        message: "Format email tidak valid.",
      });
    }

    const levelRecord = await user_level.findOne({
      where: { level_name: user_level_name },
      attributes: ["level_code"],
    });

    if (!levelRecord) {
      return res.status(400).json({
        message: `User Level '${user_level_name}' untuk pengguna baru tidak ditemukan.`,
      });
    }
    const newUserLevelCode = levelRecord.level_code;

    const existingUser = await userakses.findOne({
      where: {
        [Op.or]: [{ user_name: user_name }, { user_email: user_email }],
      },
      attributes: ["user_name", "user_email"],
    });

    if (existingUser) {
      let message = "Data sudah digunakan.";
      if (existingUser.user_name === user_name) {
        message = "Nama pengguna sudah digunakan.";
      } else if (existingUser.user_email === user_email) {
        message = "Email sudah digunakan.";
      }
      return res.status(400).json({ message });
    }

    let newUserOwnerCode = null;

    if (creatorLevel == "SUA") {
      if (!pasar_code) {
        return res.status(400).json({
          message: "Kode Pasar (pasar_code) harus dipilih oleh Super Admin.",
        });
      }
      const pasarExists = await data_pasar.findByPk(pasar_code, {
        attributes: ["pasar_code"],
      });
      if (!pasarExists) {
        return res.status(400).json({
          message: `Kode Pasar '${pasar_code}' tidak valid.`,
        });
      }
      newUserOwnerCode = pasar_code;
    } else if (creatorLevel == "PTG") {
      const creatorUser = await userakses.findByPk(creatorId, {
        attributes: ["user_owner"],
      });
      if (!creatorUser || !creatorUser.user_owner) {
        console.error(
          `Petugas (ID: ${creatorId}) tidak memiliki user_owner yang valid.`
        );
        return res.status(400).json({
          message: "Petugas pembuat tidak terhubung ke pasar yang valid.",
        });
      }
      newUserOwnerCode = creatorUser.user_owner;
    } else {
      return res.status(403).json({
        message: "Anda tidak memiliki izin untuk membuat pengguna.",
      });
    }

    let generatedUserCode = "";
    let nextSequence = 1;

    if (newUserLevelCode === "SUA") {
      const lastUser = await userakses.findOne({
        where: { user_code: { [Op.startsWith]: "USR" } },
        order: [["user_code", "DESC"]],
        attributes: ["user_code"],
      });

      if (lastUser && lastUser.user_code) {
        try {
          const lastNum = parseInt(lastUser.user_code.substring(3), 10);
          if (!isNaN(lastNum)) {
            nextSequence = lastNum + 1;
          }
        } catch (e) {
          console.error(
            "Error parsing last USR user_code:",
            lastUser.user_code,
            e
          );
          return res
            .status(500)
            .json({ message: "Gagal menghasilkan user code (USR)." });
        }
      }
      generatedUserCode = `USR${nextSequence.toString().padStart(3, "0")}`;
    } else if (newUserLevelCode === "PTG" || newUserLevelCode === "PGN") {
      if (!newUserOwnerCode) {
        console.error(
          `User level ${newUserLevelCode} requires a pasar assignment (user_owner).`
        );
        return res.status(400).json({
          message: `Pengguna dengan level ${newUserLevelCode} harus terhubung ke pasar.`,
        });
      }
      const prefix = newUserOwnerCode;

      const lastUser = await userakses.findOne({
        where: { user_code: { [Op.startsWith]: prefix } },
        order: [["user_code", "DESC"]],
        attributes: ["user_code"],
      });

      if (lastUser && lastUser.user_code) {
        try {
          const lastNum = parseInt(
            lastUser.user_code.substring(prefix.length),
            10
          );
          if (!isNaN(lastNum)) {
            nextSequence = lastNum + 1;
          }
        } catch (e) {
          console.error(
            `Error parsing last ${prefix} user_code:`,
            lastUser.user_code,
            e
          );
          return res
            .status(500)
            .json({ message: `Gagal menghasilkan user code (${prefix}).` });
        }
      }
      generatedUserCode = `${prefix}${nextSequence
        .toString()
        .padStart(3, "0")}`;
    } else {
      console.error(
        `Unhandled user level for code generation: ${newUserLevelCode}`
      );
      return res.status(400).json({
        message: `Level pengguna '${newUserLevelCode}' tidak didukung untuk pembuatan user code.`,
      });
    }

    const user_foto_filename = req.file ? req.file.filename : null;

    const hashedPassword = await bcrypt.hash(user_pass, 10);

    const newUser = await userakses.create({
      user_code: generatedUserCode,
      user_name,
      user_pass: hashedPassword,
      user_phone,
      user_email,
      user_level: newUserLevelCode,
      user_foto: user_foto_filename,
      user_status,
      user_owner: newUserOwnerCode,
    });

    const userData = newUser.toJSON();
    delete userData.user_pass;
    delete userData.user_validation;

    return res.status(201).json({
      message: "Berhasil daftar.",
      data: userData,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: error.errors.map((e) => e.message),
      });
    }

    if (
      error.name === "SequelizeUniqueConstraintError" &&
      error.fields.user_code
    ) {
      return res
        .status(409)
        .json({ message: "Gagal menghasilkan user code unik. Coba lagi." });
    }
    return res.status(500).json({
      message: "Internal server error during signup.",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Nama pengguna/email dan password dibutuhkan.",
      });
    }

    const user = await userakses.findOne({
      where: {
        [Op.or]: [{ user_name: identifier }, { user_email: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Kredensial salah atau pengguna tidak ditemukan.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.user_pass);

    if (!isMatch) {
      return res.status(401).json({
        message: "Kredensial salah atau pengguna tidak ditemukan.",
      });
    }

    if (user.user_status !== "A") {
      return res.status(403).json({
        message: "Akun pengguna tidak aktif.",
      });
    }

    const payload = {
      user_code: user.user_code,
      level: user.user_level,
      pasar_code: user.user_owner,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    user.user_validation = token;
    await user.save();

    const userData = user.toJSON();
    delete userData.user_pass;
    delete userData.user_validation;

    return res.status(200).json({
      message: "Berhasil login.",
      data: userData,
      token,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({
      message: "Internal server error during signin.",
    });
  }
};

exports.logout = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized: Sesi tidak valid." });
  }
  const userId = req.user.id;

  try {
    const user = await userakses.findByPk(userId, {
      attributes: ["user_code", "user_validation"],
    });

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    user.user_validation = null;
    await user.save();

    return res.status(200).json({
      message: "Berhasil logout.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error during logout.",
    });
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized: Sesi tidak valid." });
  }

  try {
    const user = await userakses.findByPk(userId, {
      where: {
        id: userId,
      },
      attributes: {
        exclude: ["user_pass", "user_validation"],
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({
      message: "Internal server error during profile.",
    });
  }
};

exports.editProfile = async (req, res) => {
  const userId = req.user.id;
  console.log("File received:", req.file);
  console.log("Request body:", req.body);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized: Sesi tidak valid." });
  }

  try {
    const user = await userakses.findByPk(userId, {
      where: {
        id: userId,
      },
      attributes: {
        exclude: ["user_pass", "user_validation"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { user_name, user_phone, user_email } = req.body;

    if (!user_name && !user_phone && !user_email) {
      return res.status(400).json({
        message:
          "At least one of user_name, user_phone, or user_email is required.",
      });
    }

    if (user_name) user.user_name = user_name;
    if (user_phone) user.user_phone = user_phone;
    if (user_email) user.user_email = user_email;

    if (req.file) {
      if (user.user_foto) {
        const fs = require("fs");
        const path = require("path");
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

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Edit Profile Error:", error);
    return res.status(500).json({
      message: "Internal server error during profile update.",
    });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.user.id;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized: Sesi tidak valid." });
  }

  try {
    const user = await userakses.findByPk(userId, {
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        message: "Old password and new password are required.",
      });
    }

    const isMatch = await bcrypt.compare(old_password, user.user_pass);

    if (!isMatch) {
      return res.status(401).json({
        message: "Old password is incorrect.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    user.user_pass = hashedNewPassword;
    await user.save();
    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      message: "Internal server error during password change.",
    });
  }
};
