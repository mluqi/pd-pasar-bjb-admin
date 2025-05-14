const { DB_TYPE_LAPAK } = require("../models");
const { addLogActivity } = require("./logController");

exports.getAllTypeLapak = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const typeLapaks = await DB_TYPE_LAPAK.findAll();
    return res.status(200).json(typeLapaks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getTypeLapakByCode = async (req, res) => {
  try {
    const typeLapak = await DB_TYPE_LAPAK.findOne({
      where: { TYPE_CODE: req.params.code },
    });
    if (!typeLapak)
      return res.status(404).json({ message: "Type Lapak not found" });
    res.json(typeLapak);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTypeLapak = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  const { TYPE_NAMA } = req.body;
  if (!TYPE_NAMA) {
    res.status(400).json({ message: "Name are required" });
  }

  const existingTypeLapak = await DB_TYPE_LAPAK.findOne({
    where: { TYPE_NAMA },
  });

  if (existingTypeLapak) {
    res.status(400).json({ message: "Type Lapak already exists" });
  }

  const prefix = "TYPE";
  const lastTypeLapak = await DB_TYPE_LAPAK.findOne({
    order: [["TYPE_CODE", "DESC"]],
  });

  const lastTypeCode = lastTypeLapak ? lastTypeLapak.TYPE_CODE : null;
  const lastTypeCodeNumber = lastTypeCode
    ? parseInt(lastTypeCode.slice(-3))
    : 0;
  const newTypeCodeNumber = lastTypeCodeNumber + 1;
  const typeCode = `${prefix}${String(newTypeCodeNumber).padStart(3, "0")}`;

  const typeLapakCodeExists = await DB_TYPE_LAPAK.findOne({
    where: { TYPE_CODE: typeCode },
  });

  if (typeLapakCodeExists) {
    res.status(400).json({ message: "Type Lapak code already exists" });
  }

  try {
    const newTypeLapak = await DB_TYPE_LAPAK.create(
      {
        TYPE_CODE: typeCode,
        TYPE_NAMA,
      },
      {
        logging: (query) => {
          req.sqlQuery = query;
        },
      }
    );

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: typeCode,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });

    return res.status(201).json(newTypeLapak);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: null,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "create",
    });
    return res.status(500).json({ error: error.message });
  }
};

exports.updateTypeLapak = async (req, res) => {
  try {
    const [updated] = await DB_TYPE_LAPAK.update(req.body, {
      where: { TYPE_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!updated) {
      res.status(404).json({ message: "Type Lapak not found" });
    }

    const updatedTypeLapak = await DB_TYPE_LAPAK.findOne({
      where: { TYPE_CODE: req.params.code },
    });

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });

    return res.status(200).json(updatedTypeLapak);
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "update",
    });
    return res.status(400).json({ error: error.message });
  }
};

exports.deleteTypeLapak = async (req, res) => {
  try {
    const deleted = await DB_TYPE_LAPAK.destroy({
      where: { TYPE_CODE: req.params.code },
      logging: (query) => {
        req.sqlQuery = query;
      },
    });

    if (!deleted) {
      res.status(404).json({ message: "Type Lapak not found" });
    }

    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };

    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "success",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });

    return res.status(200).json({ message: "Type Lapak deleted" });
  } catch (error) {
    const logSource = {
      user: req.user,
      query: req.sqlQuery,
    };
    await addLogActivity({
      LOG_USER: req.user.id,
      LOG_TARGET: req.params.code,
      LOG_DETAIL: "failed",
      LOG_SOURCE: Buffer.from(JSON.stringify(logSource)).toString("base64"), // Data dari params
      LOG_OWNER: req.user.owner,
      LOG_ACTION: "delete",
    });
    return res.status(500).json({ error: error.message });
  }
};
