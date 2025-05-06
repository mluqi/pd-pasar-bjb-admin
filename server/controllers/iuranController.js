const { DB_IURAN, DB_PEDAGANG } = require("../models");
const { Op } = require("sequelize");

exports.getAllIuran = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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
      include: [{ model: DB_PEDAGANG, attributes: ["CUST_CODE", "CUST_NAMA"] }],
    });
    if (!iuran) return res.status(404).json({ message: "Iuran not found" });
    return res.status(200).res.json(iuran);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createIuran = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("requst body",req.body);

  // generate unique code example: IU20231001000001 last 5 number is sequence
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  // generate code 5 angka trakhir denagn cara cari angka 5 terakhir dan terbesar baru ditambah 1
  const lastIuran = await DB_IURAN.findOne({
    where: {
      IURAN_CODE: {
        [Op.like]: `IU${year}${month}${day}%`,
      },
    },
    order: [["IURAN_CODE", "DESC"]],
  });
  let sequenceNumber = "00001"; 
  if (lastIuran) {
    const lastCode = lastIuran.IURAN_CODE;
    const lastSequence = lastCode.slice(-5);
    const newSequenceNumber = parseInt(lastSequence, 10) + 1;
    sequenceNumber = newSequenceNumber.toString().padStart(5, "0");
  }

  const uniqueCode = `IU${year}${month}${day}${sequenceNumber}`;

  //check if existing code
  const existingIuran = await DB_IURAN.findOne({
    where: { IURAN_CODE: uniqueCode },
  });

  if (existingIuran) {
    return res.status(400).json({ message: "Iuran code already exists" });
  }
  
  const {
    IURAN_PEDAGANG,
    IURAN_TANGGAL,
    IURAN_JUMLAH,
    IURAN_STATUS
  } = req.body;
  if (
    !IURAN_PEDAGANG ||
    !IURAN_TANGGAL ||
    !IURAN_JUMLAH ||
    !IURAN_STATUS 
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  const IURAN_METODE_BAYAR = req.body.IURAN_METODE_BAYAR || "";
  const IURAN_WAKTU_BAYAR = req.body.IURAN_WAKTU_BAYAR || null;

  const date = new Date(IURAN_TANGGAL);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  const newIuranTanggal = new Date(
    date.setHours(hours, minutes, seconds, milliseconds)
  );
  const IURAN_USER = userId;

  try {
    const newIuran = await DB_IURAN.create({
      IURAN_CODE: uniqueCode,
      IURAN_PEDAGANG,
      IURAN_TANGGAL: newIuranTanggal,
      IURAN_JUMLAH,
      IURAN_STATUS,
      IURAN_METODE_BAYAR,
      IURAN_WAKTU_BAYAR,
      IURAN_USER,
    });

    return res.status(201).json(newIuran);
  } catch (error) {
    console.error("Error creating Iuran:", error);
    return res.status(400).json({ error: error.message });
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
