const cron = require("node-cron");
const { DB_IURAN, DB_PEDAGANG, DB_LAPAK } = require("../models");
const { Op } = require("sequelize");

const generateDailyIuran = async () => {
  try {
    const processingDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const year = processingDate.getFullYear().toString();
    const month = (processingDate.getMonth() + 1).toString().padStart(2, "0");
    const day = processingDate.getDate().toString().padStart(2, "0");

    const todayStart = new Date(processingDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(processingDate);
    todayEnd.setHours(23, 59, 59, 999);

    const activePedagangs = await DB_PEDAGANG.findAll({
      where: { CUST_STATUS: "aktif" },
      attributes: ["CUST_CODE", "CUST_IURAN"],
      include: [
        {
          model: DB_LAPAK,
          as: "lapaks",
          where: { LAPAK_STATUS: "aktif" },
          attributes: [],
          required: true,
        },
      ],
    });

    console.log(
      `✔️ Found ${activePedagangs.length} active pedagangs with active lapaks.`
    );

    const iuransToday = await DB_IURAN.findAll({
      where: {
        IURAN_TANGGAL: { [Op.gte]: todayStart, [Op.lt]: todayEnd },
      },
      attributes: ["IURAN_PEDAGANG", "IURAN_JUMLAH"],
    });

    const iuranMap = new Map();
    for (const iuran of iuransToday) {
      const key = `${iuran.IURAN_PEDAGANG}-${iuran.IURAN_JUMLAH}`;
      iuranMap.set(key, true);
    }

    let sequenceNumber = 1;
    const lastIuran = await DB_IURAN.findOne({
      where: {
        IURAN_CODE: { [Op.like]: `IU${year}${month}${day}%` },
      },
      order: [["IURAN_CODE", "DESC"]],
    });

    if (lastIuran) {
      const lastSequence = parseInt(lastIuran.IURAN_CODE.slice(-5), 10);
      sequenceNumber = lastSequence + 1;
    }

    let generatedCount = 0;

    for (const pedagang of activePedagangs) {
      if (pedagang.CUST_IURAN === null || pedagang.CUST_IURAN === undefined)
        continue;

      const iuranJumlah = parseFloat(pedagang.CUST_IURAN);
      if (isNaN(iuranJumlah)) {
        continue;
      }

      const key = `${pedagang.CUST_CODE}-${iuranJumlah}`;
      if (iuranMap.has(key)) continue;

      const uniqueCode = `IU${year}${month}${day}${sequenceNumber
        .toString()
        .padStart(5, "0")}`;
      sequenceNumber++;

      const isFree = iuranJumlah === 0;

      await DB_IURAN.create({
        IURAN_CODE: uniqueCode,
        IURAN_PEDAGANG: pedagang.CUST_CODE,
        IURAN_TANGGAL: processingDate,
        IURAN_JUMLAH: iuranJumlah,
        IURAN_STATUS: isFree ? "paid" : "pending",
        IURAN_METODE_BAYAR: "",
        IURAN_WAKTU_BAYAR: isFree ? processingDate : null,
        IURAN_USER: isFree ? "SYSTEM" : "",
      });

      console.log(
        `✅ Generated iuran for ${pedagang.CUST_CODE} (${pedagang.CUST_IURAN})`
      );
      generatedCount++;
    }

    console.log(
      `🟢 Daily iuran generation complete. Total generated: ${generatedCount}`
    );
  } catch (error) {
    console.error("❌ Failed to generate daily iuran:", error);
  }
};

const recoveryHours = [1, 3, 6];

for (const hour of recoveryHours) {
  cron.schedule(`0 ${hour} * * *`, generateDailyIuran, {
    timezone: "Asia/Jakarta",
  });
}

console.log("🚀 Server startup: generating daily iuran immediately...");
generateDailyIuran();

module.exports = { generateDailyIuran };
