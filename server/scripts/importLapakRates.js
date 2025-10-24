const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { DB_LAPAK, DB_TYPE_LAPAK, sequelize } = require("../models");
const { Op } = require("sequelize");

// Konfigurasi
const EXCEL_FILE_PATH = path.join(__dirname, "./data_kramat.xls");

/**
 * Fungsi untuk membersihkan dan mengubah nilai menjadi integer.
 * @param {string} value - Nilai dari CSV.
 * @returns {number|null} - Nilai integer atau null jika tidak valid.
 */
const parseCurrency = (value) => {
  if (!value) return null;
  // Menghapus karakter non-digit (seperti 'Rp', '.', ',')
  const cleanedValue = String(value).replace(/[^0-9]/g, "");
  const number = parseInt(cleanedValue, 10);
  return isNaN(number) ? null : number;
};

/**
 * Fungsi utama untuk menjalankan impor.
 */
const runImport = async () => {
  console.log("🚀 Memulai proses impor tarif lapak dari Excel...");

  // 1. Verifikasi file Excel
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`❌ File tidak ditemukan di path: ${EXCEL_FILE_PATH}`);
    return;
  }

  const errors = [];
  const notFound = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let rowCount = 0;
  let results = [];

  // Memulai transaksi database
  const transaction = await sequelize.transaction();

  try {
    // 2. Baca dan parse file Excel
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[0]; // Ambil sheet pertama
    const worksheet = workbook.Sheets[sheetName];
    results = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📄 Ditemukan ${results.length} baris data di file Excel.`);

    // 3. Ambil semua tipe lapak untuk mapping
    const typeLapaks = await DB_TYPE_LAPAK.findAll({ raw: true });
    const typeMap = new Map(
      typeLapaks.map((type) => [type.TYPE_NAMA.toUpperCase(), type.TYPE_CODE])
    );
    console.log("🏷️ Berhasil memuat data Tipe Lapak untuk pencocokan.");

    // 4. Proses setiap baris dari CSV
    for (const row of results) {
      rowCount++;
      const csvType = row.TYPE ? row.TYPE.trim().toUpperCase() : null;
      const csvBlok = row.BLOK ? row.BLOK.trim() : null;
      const csvHerr = row.HERR;
      const csvIzin = row.IZIN;

      // Validasi data baris
      if (!csvType || !csvBlok) {
        errors.push(`Baris ${rowCount}: Kolom 'TYPE' atau 'BLOK' kosong.`);
        continue;
      }

      // Parsing kolom BLOK (misal: "A 3" -> "A" dan "3")
      const blokParts = csvBlok.split(/\s+/);
      if (blokParts.length < 2) {
        errors.push(
          `Baris ${rowCount}: Format 'BLOK' (${csvBlok}) tidak valid. Harusnya "HURUF ANGKA".`
        );
        continue;
      }
      const blokHuruf = blokParts[0];
      const blokAngka = blokParts.slice(1).join(" "); // Gabungkan jika ada spasi ekstra di nomor

      // Dapatkan TYPE_CODE dari nama tipe
      const typeCode = typeMap.get(csvType);
      if (!typeCode) {
        errors.push(
          `Baris ${rowCount}: Tipe Lapak '${row.TYPE}' tidak ditemukan di database.`
        );
        continue;
      }

      // Cari lapak yang cocok di database
      const lapak = await DB_LAPAK.findOne({
        where: {
          LAPAK_TYPE: typeCode,
          LAPAK_BLOK: blokHuruf,
          LAPAK_NAMA: {
            [Op.like]: `%No ${blokAngka}`, // Mencocokkan "No [angka]" di akhir nama
          },
        },
        transaction,
      });

      if (!lapak) {
        notFound.push(
          `Baris ${rowCount}: Lapak tidak ditemukan untuk Tipe: '${row.TYPE}', Blok: '${blokHuruf}', No: '${blokAngka}'`
        );
        continue;
      }

      // Konversi nilai HERR dan IZIN
      const heregistrasiValue = parseCurrency(csvHerr);
      const siptuValue = parseCurrency(csvIzin);

      // Lewati jika tidak ada nilai untuk diupdate
      if (heregistrasiValue === null && siptuValue === null) {
        skippedCount++;
        continue;
      }

      // Update data lapak
      await lapak.update(
        {
          LAPAK_HEREGISTRASI: heregistrasiValue,
          LAPAK_SIPTU: siptuValue,
        },
        { transaction }
      );

      updatedCount++;
      console.log(
        `  -> Berhasil memperbarui Lapak ${lapak.LAPAK_CODE} (Tipe: ${row.TYPE}, Blok: ${csvBlok})`
      );
    }

    // 5. Finalisasi
    if (errors.length > 0) {
      // Jika ada error, batalkan semua perubahan
      console.error("\n❌ Terjadi kesalahan. Membatalkan semua perubahan...");
      await transaction.rollback();
      console.error("Kesalahan yang ditemukan:");
      errors.forEach((e) => console.error(`  - ${e}`));
    } else {
      // Jika semua berhasil, commit transaksi
      await transaction.commit();
      console.log(
        "\n✅ Semua data valid. Perubahan telah disimpan ke database."
      );
    }

    // 6. Tampilkan Ringkasan Hasil
    console.log("\n--- ✨ Ringkasan Impor ---");
    console.log(`Total Baris CSV Diproses : ${rowCount}`);
    console.log(`Data Lapak Diperbarui    : ${updatedCount}`);
    console.log(`Data Dilewati (kosong)   : ${skippedCount}`);
    console.log(`Data Lapak Tidak Ditemukan : ${notFound.length}`);
    console.log(`Kesalahan Format Data    : ${errors.length}`);
    console.log("--------------------------\n");

    if (notFound.length > 0) {
      console.log("🔍 Detail Data Lapak yang Tidak Ditemukan:");
      notFound.forEach((item) => console.log(`  - ${item}`));
      console.log("\n");
    }
  } catch (error) {
    // Rollback jika ada error tak terduga
    await transaction.rollback();
    console.error("\n❌ Terjadi kesalahan fatal saat pemrosesan:", error);
    console.error("Semua perubahan telah dibatalkan.");
  } finally {
    // Tutup koneksi database
    await sequelize.close();
    console.log("🔌 Koneksi database ditutup.");
  }
};

// Jalankan fungsi impor
runImport();
