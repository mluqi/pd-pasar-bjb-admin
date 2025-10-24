const cron = require("node-cron");
const {
  DB_PEDAGANG,
  DB_LAPAK,
  Invoices,
  data_pasar,
  sequelize,
} = require("../models"); // Pastikan Sequelize diimpor jika belum
const { Op } = require("sequelize");

const generateAnnualInvoices = async () => {
  console.log("🚀 Starting annual invoice generation job...");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startCycleYear = 2025; // Tahun awal siklus dimulai dari 2025

  // Tentukan tipe invoice berdasarkan siklus 3 tahun
  const yearInCycle = (currentYear - startCycleYear) % 3;
  let invoiceType;
  let nominalField;

  if (yearInCycle === 0 || yearInCycle === 1) {
    // Tahun ke-1 dan ke-2
    invoiceType = "heregistrasi";
    nominalField = "LAPAK_HEREGISTRASI";
  } else {
    // Tahun ke-3
    invoiceType = "siptu";
    nominalField = "LAPAK_SIPTU";
  }

  console.log(
    `📅 Year: ${currentYear}, Cycle Year: ${
      yearInCycle + 1
    }, Invoice Type: ${invoiceType}`
  );

  try {
    // --- Pengecekan Invoice yang Sudah Ada ---
    // 1. Dapatkan daftar ID pedagang yang sudah punya invoice untuk tipe dan tahun ini.
    const pedagangsWithInvoice = await Invoices.findAll({
      where: {
        invoice_type: invoiceType,
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("invoice_date")),
            currentYear
          ),
        ],
      },
      attributes: ["invoice_pedagang"],
      raw: true,
    });

    const pedagangCodesToExclude = pedagangsWithInvoice.map(
      (inv) => inv.invoice_pedagang
    );

    // 1. Ambil semua pedagang aktif yang punya lapak aktif
    const activePedagangs = await DB_PEDAGANG.findAll({
      where: {
        CUST_STATUS: "aktif",
        CUST_CODE: { [Op.notIn]: pedagangCodesToExclude },
      },
      include: [
        {
          model: DB_LAPAK,
          as: "lapaks",
          attributes: ["LAPAK_CODE", "LAPAK_OWNER", nominalField], // Ambil nominalField
          required: true,
          include: [
            {
              model: data_pasar,
              as: "pasar",
              attributes: [
                "pasar_code",
                "pasar_tanggal_jatuh_tempo", // Ambil tanggal jatuh tempo
              ],
              required: true, // Pastikan lapak memiliki pasar yang valid
            },
          ],
        },
      ],
    });

    console.log(
      `Found ${pedagangCodesToExclude.length} pedagangs who already have an invoice. They will be excluded.`
    );
    console.log(`✔️ Found ${activePedagangs.length} new pedagangs to process.`);
    if (activePedagangs.length === 0) return;

    const invoiceDate = new Date();

    // --- Logika pembuatan kode invoice ---
    const year = invoiceDate.getFullYear().toString().slice(-2);
    const month = (invoiceDate.getMonth() + 1).toString().padStart(2, "0");
    const day = invoiceDate.getDate().toString().padStart(2, "0");

    // Cari invoice terakhir untuk hari ini dengan format baru
    const lastInvoiceToday = await Invoices.findOne({
      where: {
        invoice_code: {
          [Op.like]: `INV${year}${month}${day}%`,
        },
      },
      order: [["invoice_code", "DESC"]],
    });

    let sequence = 1;
    if (lastInvoiceToday) {
      // Ambil 4 digit terakhir sebagai nomor urut, lalu tambah 1
      const lastSequence = parseInt(lastInvoiceToday.invoice_code.slice(-4));
      sequence = lastSequence + 1;
    }

    const invoicesToCreate = [];

    // 2. Siapkan data invoice untuk setiap pedagang
    for (const pedagang of activePedagangs) {
      if (!pedagang.lapaks || pedagang.lapaks.length === 0) {
        continue;
      }

      // Jumlahkan nominal dari semua lapak milik pedagang
      const lapakCodes = pedagang.lapaks.map((lapak) => lapak.LAPAK_CODE);
      const totalNominal = pedagang.lapaks.reduce((sum, lapak) => {
        const nominal = lapak[nominalField] || 0;
        return sum + nominal;
      }, 0);

      if (totalNominal > 0) {
        // Ambil pasar dari lapak pertama (asumsi semua lapak pedagang di pasar yang sama)
        const pasarCode = pedagang.lapaks[0].LAPAK_OWNER;

        // Tentukan tanggal jatuh tempo
        const jatuhTempoMMDD =
          pedagang.lapaks[0].pasar?.pasar_tanggal_jatuh_tempo; // Format "MM-DD"
        let dueDate;
        if (jatuhTempoMMDD && /^\d{2}-\d{2}$/.test(jatuhTempoMMDD)) {
          // Gabungkan dengan tahun saat ini
          dueDate = new Date(`${currentYear}-${jatuhTempoMMDD}`);
        } else {
          // Fallback: 30 hari dari sekarang jika format tidak valid atau tidak ada
          dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        // Buat kode invoice unik
        const invoiceCode = `INV${year}${month}${day}${sequence // Format sudah benar
          .toString()
          .padStart(4, "0")}`;

        invoicesToCreate.push({
          invoice_code: invoiceCode,
          invoice_pedagang: pedagang.CUST_CODE,
          invoice_nominal: totalNominal,
          invoice_date: invoiceDate.toISOString().slice(0, 10),
          invoice_tempo: dueDate.toISOString().slice(0, 10), // Gunakan dueDate yang sudah ditentukan
          invoice_type: invoiceType,
          invoice_pasar: pasarCode,
          invoice_lapak: lapakCodes, // Simpan array kode lapak
          invoice_status: "pending",
        });

        // Naikkan nomor urut untuk invoice berikutnya
        sequence++;
      }
    }

    // 3. Buat semua invoice dalam satu operasi bulkCreate
    if (invoicesToCreate.length > 0) {
      await Invoices.bulkCreate(invoicesToCreate);
      console.log(
        `✅ Successfully generated ${invoicesToCreate.length} invoices.`
      );
    }

    console.log("🏁 Annual invoice generation job finished.");
  } catch (error) {
    console.error("❌ Failed to generate annual invoices:", error);
  }
};

// Jalankan job setiap tanggal 1 November jam 1 pagi
cron.schedule("0 1 1 11 *", generateAnnualInvoices, {
  timezone: "Asia/Jakarta",
});

console.log(
  "⏰ Cron job for annual invoice generation is scheduled for every Nov 1st at 01:00 AM."
);

// (Opsional) Jalankan sekali saat server start untuk testing
setTimeout(generateAnnualInvoices, 5000); // Jalankan 5 detik setelah server start

module.exports = { generateAnnualInvoices };
