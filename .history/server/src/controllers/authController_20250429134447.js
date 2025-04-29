const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userakses } = require("../../models");

exports.signup = async (req, res) => {
  try {
    const {
      username,
      password,
      user_phone,
      user_email,
      user_level_name,
      user_status,
    } = req.body;

    if (
      !username ||
      !password ||
      !user_phone ||
      !user_email ||
      !user_level ||
      user_status
    ) {
      return res.status(400).json({
        message: "Data tidak lengkap",
      });
    }

    const user_level = await user_level.findOne({
      where: {
        level_name: user_level_name,
      },
    });
    if (!user_level) {

    const user_foto = req.files?.user_foto?.[0]?.filename || null;

    const isExistUsername = await userakses.findOne({
      where: {
        username,
      },
    });

    const isExistEmail = await userakses.findOne({
      where: {
        user_email,
      },
    });

    if (isExistUsername || isExistEmail) {
      return res.status(400).json({
        message: "Username sudah digunakan",
      });
    }

    if (!user_email.includes("@")) {
      return res.status(400).json({
        message: "Email tidak valid",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newuserakses = await userakses.create({
      user_phone,
      user_email,
      password: hashedPassword,
      user_level: user_level.level_code,
      user_foto,
      user_status,
    });

    return res.status(200).json({
      message: "Berhasil daftar",
      data: newuserakses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userakses.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        message: "Data username dan password",
      });
    }

    const token = jwt.sign({ id: userakses.user_code }, process.env.JWT_SECRET);

    userakses.user_validation = token;
    await user.save();

    return res.status(200).json({
      message: "Berhasil login",
      data: user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.logout = async (req, res) => {
  if (!req.userakses) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await userakses.findByPk(req.userakses.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.user_validation = null;
    await user.save();

    return res.status(200).res.json({
      message: "Berhasil logout",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
