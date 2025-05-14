const jwt = require("jsonwebtoken");
const { userakses } = require("../models");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userakses.findByPk(verified.user_code);

    if (user.user_validation !== token) {
      return res.status(401).json({ error: "Token revoked!" });
    }

    req.user = {
      id: verified.user_code,
      name: verified.user_name,
      level: verified.level,
      owner: verified.pasar_code,
    };

    console.log(req.user);

    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
