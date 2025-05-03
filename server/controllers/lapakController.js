const { DB_LAPAK, DB_PEDAGANG } = require("../models");

exports.getAllLapak = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

  try {
    const lapaks = await DB_LAPAK.findAll({
      include: [{ model: DB_PEDAGANG, as: "penyewa" }],
    });
    res.json(lapaks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLapakByCode = async (req, res) => {
  try {
    const lapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: req.params.code },
      include: [{ model: DB_PEDAGANG, as: "penyewa" }],
    });
    if (!lapak) return res.status(404).json({ message: "Lapak not found" });
    res.json(lapak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLapak = async (req, res) => {
  try {
    const newLapak = await DB_LAPAK.create(req.body);
    res.status(201).json(newLapak);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateLapak = async (req, res) => {
  try {
    const [updated] = await DB_LAPAK.update(req.body, {
      where: { LAPAK_CODE: req.params.code },
    });
    if (!updated) return res.status(404).json({ message: "Lapak not found" });
    const updatedLapak = await DB_LAPAK.findOne({
      where: { LAPAK_CODE: req.params.code },
    });
    res.json(updatedLapak);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLapak = async (req, res) => {
  try {
    const deleted = await DB_LAPAK.destroy({
      where: { LAPAK_CODE: req.params.code },
    });
    if (!deleted) return res.status(404).json({ message: "Lapak not found" });
    res.json({ message: "Lapak deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
