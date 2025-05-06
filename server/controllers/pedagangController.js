const { DB_PEDAGANG, DB_LAPAK } = require("../models");
const { Sequelize } = require("sequelize");
const Joi = require("joi");

const pedagangSchema = Joi.object({
  CUST_NAMA: Joi.string().min(3).max(100).required(),
  CUST_NIK: Joi.string().length(16).required(),
  CUST_PHONE: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
  CUST_OWNER: Joi.string().required(),
});

exports.getAllPedagang = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const pedagang = await DB_PEDAGANG.findAll();
    return res.status(200).json(pedagang);
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
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { error } = pedagangSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { CUST_NAMA, CUST_NIK, CUST_PHONE, CUST_OWNER } = req.body;

  const transaction = await DB_PEDAGANG.sequelize.transaction();

  try {
    const existingPedagang = await DB_PEDAGANG.findOne({
      where: {
        [Sequelize.Op.or]: [{ CUST_NIK }, { CUST_PHONE }],
      },
    });

    if (existingPedagang) {
      await transaction.rollback();
      return res.status(400).json({ message: "Pedagang already exists" });
    }
    
    const lastPedagang = await DB_PEDAGANG.findOne({
      order: [["CUST_CODE", "DESC"]],
    });

    const lastCode = lastPedagang ? lastPedagang.CUST_CODE : "CUST00000";
    const lastCodeNumber = parseInt(lastCode.replace("CUST", ""));
    const newCodeNumber = lastCodeNumber + 1;
    const newCode = `CUST${String(newCodeNumber).padStart(5, "0")}`;
    const CUST_CODE = newCode;

    const newPedagang = await DB_PEDAGANG.create(
      {
        CUST_CODE,
        CUST_NAMA,
        CUST_NIK,
        CUST_PHONE,
        CUST_OWNER,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).json(newPedagang);
  } catch (error) {
    console.error("Error creating pedagang:", error);
    return res.status(500).json({ error: error.message });
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
