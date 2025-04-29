const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userakses, user_level } = require("../models"); // Assuming user_level model is correctly imported
const { Op } = require("sequelize"); // Import Op for OR queries

exports.signup = async (req, res) => {
  try {
    const {
      user_name,
      user_pass, 
      user_phone,
      user_email,
      user_level_name, 
      user_status, 
      // user_owner // This might also be needed depending on your model constraints
    } = req.body;

    if (
      !user_name ||
      !user_pass ||
      !user_phone ||
      !user_email ||
      !user_level_name ||
      !user_status // Ensure status is provided or set a default later
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
      where: {
        level_name: user_level_name, 
      },
      attributes: ['level_code'],
    });

    if (!levelRecord) {
      return res.status(400).json({
        message: `User Level '${user_level_name}' tidak ditemukan.`,
      });
    }
    const userLevelCode = levelRecord.level_code; 

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

    const user_foto_filename = req.file ? req.file.filename : null;

    const hashedPassword = await bcrypt.hash(user_pass, 10);

    const newUser = await userakses.create({
      user_code : usercode,
      user_name,
      user_pass: hashedPassword,
      user_phone,
      user_email,
      user_level: userLevelCode, 
      user_foto: user_foto_filename, 
      user_status, 
      // user_owner: user_owner // Assign if provided/required
      // user_code: generateUniqueCodeIfNeeded() // Generate if needed
    });

    // --- 7. Prepare and Send Response ---
    // Exclude sensitive data from the response
    const userData = newUser.toJSON();
    delete userData.user_pass; // Remove password hash
    delete userData.user_validation; // Remove validation token field

    // Use 201 Created status code
    return res.status(201).json({
      message: "Berhasil daftar.",
      data: userData,
    });

  } catch (error) {
    console.error("Signup Error:", error); // Log the actual error
    // Handle potential validation errors from Sequelize
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
    // Assume client sends 'identifier' (which can be username or email) and 'password'
    const { identifier, password } = req.body;

    // --- 1. Input Validation ---
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Nama pengguna/email dan password dibutuhkan.",
      });
    }

    // --- 2. Find User ---
    // Find by EITHER user_name OR user_email
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
