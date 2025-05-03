const { DB_PEDAGANG, DB_LAPAK } = require("../models");

exports.getAllPedagang = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
  try {
    const pedagang = await DB_PEDAGANG.findAll({
      include: [{ model: DB_LAPAK, as: "lapaks" }],
    });
    res.json(pedagang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPedagangById = async (req, res) => {
  try {
    const pedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: req.params.code },
      include: [{ model: DB_LAPAK, as: "lapaks" }],
    });
    if (!pedagang)
      return res.status(404).json({ message: "Pedagang not found" });
    res.json(pedagang);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPedagang = async (req, res) => {
  try {
    const newPedagang = await DB_PEDAGANG.create(req.body);
    res.status(201).json(newPedagang);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePedagang = async (req, res) => {
  try {
    const [updated] = await DB_PEDAGANG.update(req.body, {
      where: { CUST_CODE: req.params.code },
    });
    if (!updated)
      return res.status(404).json({ message: "Pedagang not found" });
    const updatedPedagang = await DB_PEDAGANG.findOne({
      where: { CUST_CODE: req.params.code },
    });
    res.json(updatedPedagang);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletePedagang = async (req, res) => {
  try {
    const deleted = await DB_PEDAGANG.destroy({
      where: { CUST_CODE: req.params.code },
    });
    if (!deleted)
      return res.status(404).json({ message: "Pedagang not found" });
    res.json({ message: "Pedagang deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};