const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// Make sure data_pasar is imported if you need to validate the pasar_code
const { userakses, user_level, data_pasar } = require("../models");
const { Op } = require("sequelize");

// Helper function for generating user_code (replace with your actual logic)
function generateUserCode(levelCode, pasarCode = null) {
    const timestamp = Date.now().toString().slice(-6); // Example: last 6 digits of timestamp
    if (levelCode === 'SUA') {
        return `SUA-${timestamp}`;
    } else if (levelCode === 'PTG' && pasarCode) {
        // Example: PTG-PSRBJB-123456 (assuming pasarCode is like PSRBJB)
        return `PTG-${pasarCode.toUpperCase()}-${timestamp}`;
    } else {
        // Fallback for other levels or missing info
        return `USR-${timestamp}`;
    }
}


exports.signup = async (req, res) => {
  // --- Get Logged-in User Info (from authMiddleware) ---
  if (!req.user || !req.user.id || !req.user.level) {
      return res.status(401).json({ message: "Otentikasi diperlukan untuk tindakan ini." });
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
      pasar_code 
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
        message: "Data tidak lengkap (nama, pass, phone, email, level_name, status diperlukan).",
      });
    }

    if (!user_email.includes("@")) {
      return res.status(400).json({
        message: "Format email tidak valid.",
      });
    }

    const levelRecord = await user_level.findOne({
      where: { level_name: user_level_name },
      attributes: ['level_code'],
    });

    if (!levelRecord) {
      return res.status(400).json({
        message: `User Level '${user_level_name}' untuk pengguna baru tidak ditemukan.`,
      });
    }
    const newUserLevelCode = levelRecord.level_code;

    const existingUser = await userakses.findOne({
      where: {
        [Op.or]: [
          { user_name: user_name },
          { user_email: user_email }
        ]
      },
      attributes: ['user_name', 'user_email'],
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

    if (creatorLevel === 'SUA') { 
        if (!pasar_code) {
            return res.status(400).json({
                message: "Kode Pasar (pasar_code) harus dipilih oleh Super Admin.",
            });
        }
        const pasarExists = await data_pasar.findByPk(pasar_code, { attributes: ['pasar_code'] });
        if (!pasarExists) {
            return res.status(400).json({
                message: `Kode Pasar '${pasar_code}' tidak valid.`,
            });
        }
        newUserOwnerCode = pasar_code;

    } else if (creatorLevel === 'PTG') { 
        const creatorUser = await userakses.findByPk(creatorId, {
            attributes: ['user_owner']
        });
        if (!creatorUser || !creatorUser.user_owner) {
            console.error(`Petugas (ID: ${creatorId}) tidak memiliki user_owner yang valid.`);
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

    const generatedUserCode = generateUserCode(newUserLevelCode, newUserOwnerCode);

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
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
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
        [Op.or]: [
          { user_name: identifier },
          { user_email: identifier }
        ]
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

    if (user.user_status !== 'A') {
        return res.status(403).json({
            message: "Akun pengguna tidak aktif.",
        });
    }

    const payload = {
      id: user.id,
      level: user.user_level
    };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET
    );

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
        attributes: ['id', 'user_validation']
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
