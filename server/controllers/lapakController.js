const { DB_LAPAK, DB_PEDAGANG } = require("../models");

exports.getAllLapak = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const lapaks = await DB_LAPAK.findAll({
      include: [{ model: DB_PEDAGANG }],
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
      include: [{ model: DB_PEDAGANG }],
    });
    if (!lapak) return res.status(404).json({ message: "Lapak not found" });
    res.json(lapak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLapak = async (req, res) => {
  console.log("Request body:", req.body);
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body is empty or invalid" });
  }

  const { LAPAK_NAMA, LAPAK_BLOK, LAPAK_UKURAN, LAPAK_TYPE, LAPAK_STATUS } = req.body;
  if (!LAPAK_NAMA || !LAPAK_BLOK || !LAPAK_UKURAN || !LAPAK_TYPE || !LAPAK_STATUS) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const LAPAK_OWNER = req.body.LAPAK_OWNER || "";
  const LAPAK_MULAI = req.body.LAPAK_MULAI || null
  const LAPAK_AKHIR = req.body.LAPAK_AKHIR || null
  const LAPAK_PENYEWA = req.body.LAPAK_PENYEWA || "";

  const existingLapak = await DB_LAPAK.findOne({
    where: { LAPAK_NAMA, LAPAK_BLOK, LAPAK_UKURAN, LAPAK_TYPE },
  });
  if (existingLapak) {
    return res.status(400).json({ message: "Lapak already exists" });
  }

  const codePasar = LAPAK_OWNER;
  const prefix = "LAP";
  const lastLapak = await DB_LAPAK.findOne({
    where: { LAPAK_OWNER: codePasar },
    order: [["LAPAK_CODE", "DESC"]],
  });
  const lastLapakCode = lastLapak ? lastLapak.LAPAK_CODE : null;
  const lastLapakNumber = lastLapakCode ? parseInt(lastLapakCode.slice(-3)) : 0;
  const newLapakNumber = lastLapakNumber + 1;
  const lapakCode = `${codePasar}${prefix}${String(newLapakNumber).padStart(3, "0")}`;
  
  const lapakCodeExists = await DB_LAPAK.findOne({
    where: { LAPAK_CODE: lapakCode },
  });
  if (lapakCodeExists) {
    return res.status(400).json({ message: "Lapak code already exists" });
  }

  try {
    const newLapak = await DB_LAPAK.create({
      LAPAK_CODE: lapakCode,
      LAPAK_NAMA,
      LAPAK_BLOK,
      LAPAK_UKURAN,
      LAPAK_TYPE,
      LAPAK_PENYEWA,
      LAPAK_MULAI,
      LAPAK_AKHIR,
      LAPAK_STATUS,
      LAPAK_OWNER,
    });

    return res.status(201).json(newLapak);
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
