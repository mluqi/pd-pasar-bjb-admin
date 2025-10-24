const { LOG_ACTIVITY } = require("../models");
const qrisService = require("../services/qrGenerate");

exports.generateQris = async (req, res) => {
  try {
    const { nominal, pasar_code } = req.body;

    if (!nominal || isNaN(nominal) || !pasar_code) {
      // Log failed attempt
      await LOG_ACTIVITY.create({
        activity: "Generate QRIS",
        description: `Failed to generate QRIS - Invalid input: ${JSON.stringify(
          req.body
        )}`,
        ip_address: req.ip,
        user_agent: req.get("user-agent") || "Unknown",
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Nominal harus berupa angka dan pasar_code wajib diisi",
      });
    }

    const dynamicQris = await qrisService.generateDynamicQRIS(
      nominal,
      pasar_code
    );

    // Log successful generation
    await LOG_ACTIVITY.create({
      activity: "Generate QRIS",
      description: `Generated QRIS for amount: ${nominal} at pasar: ${pasar_code}`,
      ip_address: req.ip,
      user_agent: req.get("user-agent") || "Unknown",
      status: "success",
    });

    return res.status(200).json({
      success: true,
      data: {
        qris: dynamicQris,
        nominal: nominal,
      },
    });
  } catch (error) {
    // Log error
    await LOG_ACTIVITY.create({
      activity: "Generate QRIS",
      description: `Error generating QRIS - ${
        error.message
      } - Input: ${JSON.stringify(req.body)}`,
      ip_address: req.ip,
      user_agent: req.get("user-agent") || "Unknown",
      status: "error",
    });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
