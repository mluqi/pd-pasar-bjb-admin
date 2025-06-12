const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const baseDir = "uploads/";
    let subDir = "";

    if (file.fieldname === "bukti_foto") {
      subDir = "lapak_bukti/";
    } else if (file.fieldname === "bukti_foto_iuran") { 
      subDir = "iuran_bukti/";
    }
    const fullPath = path.join(baseDir, subDir);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error("Only JPG, JPEG, PNG files are allowed."));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
