const { user_level } = require("../models");

exports.getAllLevel = async (req, res) => {
  try {
    const allLevel = await user_level.findAll();
    res.status(200).json(allLevel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
