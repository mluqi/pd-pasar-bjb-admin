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

    const user = await userakses.findByPk(verified.id);

    if (user.accessToken !== token) {
      return res.status(401).json({ error: "Token revoked!" });
    }

    req.userakses = {
      id: verified.id,
    };

    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;