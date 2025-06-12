const cron = require("node-cron");
const { DB_IURAN, DB_PEDAGANG, DB_LAPAK } = require("../models"); // Import DB_LAPAK
const { Op } = require("sequelize");

const generateDailyIuran = async () => {
  try {
    const processingDate = new Date(); // Date and time when the job runs
    const year = processingDate.getFullYear().toString();
    const month = (processingDate.getMonth() + 1).toString().padStart(2, "0");
    const day = processingDate.getDate().toString().padStart(2, "0");

    // Define start and end of the current day for checking existing iuran
    const todayStart = new Date(processingDate);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(processingDate);
    todayEnd.setHours(23, 59, 59, 999);

    const activePedagangs = await DB_PEDAGANG.findAll({
      // Find active pedagangs
      where: { CUST_STATUS: "aktif" },
      attributes: ['CUST_CODE', 'CUST_IURAN'],
      include: [{
        model: DB_LAPAK,
        where: { LAPAK_STATUS: "aktif" },
        attributes: [], 
        required: true
      }]
    });

    console.log(`Found ${activePedagangs.length} active pedagangs with active lapaks for iuran generation.`);

    // Loop through the filtered list of pedagangs
    for (const pedagang of activePedagangs) {
      if (pedagang.CUST_IURAN == null) {
        console.warn(`Pedagang ${pedagang.CUST_CODE} is missing CUST_IURAN or CUST_LAPAK. Skipping iuran generation.`);
        continue;
      }

      // Check if an iuran already exists for this pedagang, for this amount, on this day
      const existingIuranForPedagangToday = await DB_IURAN.findOne({
        where: {
          IURAN_PEDAGANG: pedagang.CUST_CODE,
          IURAN_JUMLAH: parseFloat(pedagang.CUST_IURAN),
          IURAN_TANGGAL: {
            [Op.gte]: todayStart,
            [Op.lt]: todayEnd, // Records from todayStart up to (but not including) tomorrowStart
          },
        },
      });

      if (existingIuranForPedagangToday) {
        console.log(`Iuran already exists for pedagang: ${pedagang.CUST_CODE} (Jumlah: ${pedagang.CUST_IURAN}) on ${processingDate.toDateString()}. Skipping.`);
        continue; // Skip to the next pedagang
      }

      // If no existing iuran, proceed to generate IURAN_CODE and create the new iuran
      const lastIuranForCodeGeneration = await DB_IURAN.findOne({
        where: {
          IURAN_CODE: {
            [Op.like]: `IU${year}${month}${day}%`,
          },
        },
        order: [["IURAN_CODE", "DESC"]],
      });

      let sequenceNumber = "00001";
      if (lastIuranForCodeGeneration) {
        const lastCode = lastIuranForCodeGeneration.IURAN_CODE;
        const lastSequence = lastCode.slice(-5);
        const newSequenceNumber = parseInt(lastSequence, 10) + 1;
        sequenceNumber = newSequenceNumber.toString().padStart(5, "0");
      }

      const uniqueCode = `IU${year}${month}${day}${sequenceNumber}`;

      const iuranData = {
        IURAN_CODE: uniqueCode,
        IURAN_PEDAGANG: pedagang.CUST_CODE,
        IURAN_TANGGAL: processingDate, // Store with the current timestamp
        IURAN_JUMLAH: parseFloat(pedagang.CUST_IURAN),
        IURAN_STATUS: "pending",
        IURAN_METODE_BAYAR: "",
        IURAN_WAKTU_BAYAR: null,
        IURAN_USER: "", 
      };

      await DB_IURAN.create(iuranData);
      console.log(`Iuran generated for pedagang: ${pedagang.CUST_CODE} (Jumlah: ${pedagang.CUST_IURAN})`);
    }
  } catch (error) {
    console.error("Failed to generate daily iuran:", error);
  }
};

cron.schedule("0 1 * * *", generateDailyIuran);

module.exports = { generateDailyIuran };