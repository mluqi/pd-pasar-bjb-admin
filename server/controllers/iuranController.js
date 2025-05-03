const { DB_IURAN, DB_PEDAGANG } = require("../models");

exports.getAllIuran = async (req, res) => {
  try {
    const iuran = await DB_IURAN.findAll({
      include: [{ model: DB_PEDAGANG }],
    });
    res.json(iuran);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIuranByCode = async (req, res) => {
  try {
    const iuran = await DB_IURAN.findOne({
      where: { IURAN_CODE: req.params.code },
      include: [{ model: DB_PEDAGANG }],
    });
    if (!iuran) return res.status(404).json({ message: "Iuran not found" });
    res.json(iuran);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createIuran = async (req, res) => {
  try {
    const newIuran = await DB_IURAN.create(req.body);
    res.status(201).json(newIuran);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateIuran = async (req, res) => {
  try {
    const [updated] = await DB_IURAN.update(req.body, {
      where: { IURAN_CODE: req.params.code },
    });
    if (!updated) return res.status(404).json({ message: "Iuran not found" });
    const updatedIuran = await DB_IURAN.findOne({
      where: { IURAN_CODE: req.params.code },
    });
    res.json(updatedIuran);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteIuran = async (req, res) => {
  try {
    const deleted = await DB_IURAN.destroy({
      where: { IURAN_CODE: req.params.code },
    });
    if (!deleted) return res.status(404).json({ message: "Iuran not found" });
    res.json({ message: "Iuran deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
