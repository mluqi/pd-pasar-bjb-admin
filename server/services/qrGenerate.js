const { data_pasar } = require("../models");

class QRISService {
  /**
   * Generate dynamic QRIS with specified amount based on a static QRIS from the database.
   * @param {number} nominal - Amount in Rupiah
   * @param {string} pasar_code - The code of the market to get the static QRIS from.
   * @returns {Promise<string>} Dynamic QRIS string
   */
  async generateDynamicQRIS(nominal, pasar_code) {
    if (!nominal) {
      throw new Error("Nominal amount is required");
    }
    if (!pasar_code) {
      throw new Error("Pasar code is required");
    }

    const pasar = await data_pasar.findOne({
      where: { pasar_code: pasar_code },
      attributes: ["pasar_qrcode"],
    });

    if (!pasar || !pasar.pasar_qrcode) {
      throw new Error(`Static QRIS for pasar code ${pasar_code} not found.`);
    }

    const staticQris = pasar.pasar_qrcode;

    // Remove last 4 characters (CRC) from static QRIS
    let qris = staticQris.substring(0, staticQris.length - 4);

    // Replace static indicator with dynamic
    let step1 = qris.replace("010211", "010212");

    // Split by country code
    let step2 = step1.split("5802ID");

    // Create amount field
    let amount =
      "54" +
      nominal.toString().length.toString().padStart(2, "0") +
      nominal +
      "5802ID";

    // Reconstruct QRIS
    let finalQris = step2[0].trim() + amount + step2[1].trim();

    // Add new CRC
    finalQris += this.convertCRC16(finalQris);

    return finalQris;
  }

  /**
   * Calculate CRC16 checksum
   * @private
   * @param {string} str - Input string
   * @returns {string} CRC16 checksum in hexadecimal
   */
  convertCRC16(str) {
    let crc = 0xffff;
    const strlen = str.length;

    for (let c = 0; c < strlen; c++) {
      crc ^= str.charCodeAt(c) << 8;

      for (let i = 0; i < 8; i++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }

    let hex = (crc & 0xffff).toString(16).toUpperCase();

    if (hex.length === 3) {
      hex = "0" + hex;
    }

    return hex;
  }
}

module.exports = new QRISService();
