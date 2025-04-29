const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userakses, user_level } = require("../models"); // Assuming user_level model is correctly imported
const { Op } = require("sequelize"); // Import Op for OR queries

exports.signup = async (req, res) => {
  try {
    // Destructure using the correct field names expected from the request/model
    const {
      user_name,
      user_pass, // Expecting user_pass from request based on model
      user_phone,
      user_email,
      user_level_name, 
      user_status, 
      // user_owner // This might also be needed depending on your model constraints
    } = req.body;

    if (
      !user_name ||
      !user_pass ||
      !user_phone ||
      !user_email ||
      !user_level_name ||
      !user_status // Ensure status is provided or set a default later
    ) {
      return res.status(400).json({
        message: "Data tidak lengkap (nama, pass, phone, email, level_name, status diperlukan).",
      });
    }

    if (!user_email.includes("@")) {
      return res.status(400).json({
        message: "Format email tidak valid.",
      });
    }

    // --- 2. Find User Level Code ---
    // Use a different variable name to avoid shadowing the model
    const levelRecord = await user_level.findOne({
      where: {
        level_name: user_level_name, // Find level by its name
      },
      attributes: ['level_code'], // Only fetch the code
    });

    if (!levelRecord) {
      return res.status(400).json({
        message: `User Level '${user_level_name}' tidak ditemukan.`,
      });
    }
    const userLevelCode = levelRecord.level_code; // Get the code (e.g., 'ADM', 'STF')

    // --- 3. Check for Existing User ---
    const existingUser = await userakses.findOne({
      where: {
        [Op.or]: [ // Check if either username or email already exists
          { user_name: user_name },
          { user_email: user_email }
        ]
      },
      attributes: ['user_name', 'user_email'], // Only need these to check which one exists
    });

    if (existingUser) {
      let message = "Data sudah digunakan.";
      if (existingUser.user_name === user_name) {
        message = "Nama pengguna sudah digunakan.";
      } else if (existingUser.user_email === user_email) {
        message = "Email sudah digunakan.";
      }
      return res.status(400).json({ message });
    }

    // --- 4. Handle File Upload ---
    // Ensure your file upload middleware (like multer) runs *before* this controller
    // and attaches file info to req.file or req.files
    const user_foto_filename = req.file ? req.file.filename : null; // Use req.file if using upload.single()

    // --- 5. Hash Password ---
    // Use the correct variable 'user_pass' from destructuring
    const hashedPassword = await bcrypt.hash(user_pass, 10); // Salt rounds = 10

    // --- 6. Create User ---
    const newUser = await userakses.create({
      user_name,
      user_pass: hashedPassword, // Store the hashed password
      user_phone,
      user_email,
      user_level: userLevelCode, // Store the level code found earlier
      user_foto: user_foto_filename, // Store the filename from upload
      user_status, // Store the provided status
      // user_owner: user_owner // Assign if provided/required
      // user_code: generateUniqueCodeIfNeeded() // Generate if needed
    });

    // --- 7. Prepare and Send Response ---
    // Exclude sensitive data from the response
    const userData = newUser.toJSON();
    delete userData.user_pass; // Remove password hash
    delete userData.user_validation; // Remove validation token field

    // Use 201 Created status code
    return res.status(201).json({
      message: "Berhasil daftar.",
      data: userData,
    });

  } catch (error) {
    console.error("Signup Error:", error); // Log the actual error
    // Handle potential validation errors from Sequelize
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: "Validation Error", errors: error.errors.map(e => e.message) });
    }
    return res.status(500).json({
      message: "Internal server error during signup.",
    });
  }
};

exports.signin = async (req, res) => {
  try {
    // Assume client sends 'identifier' (which can be username or email) and 'password'
    const { identifier, password } = req.body;

    // --- 1. Input Validation ---
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Nama pengguna/email dan password dibutuhkan.",
      });
    }

    // --- 2. Find User ---
    // Find by EITHER user_name OR user_email
    const user = await userakses.findOne({
      where: {
        [Op.or]: [
          { user_name: identifier },
          { user_email: identifier }
        ]
      },
      // Include associated user_level details if needed, using the alias 'role'
      // include: [{ model: user_level, as: 'role', attributes: ['level_name'] }]
    });

    // --- 3. Verify User and Password ---
    if (!user) {
      return res.status(401).json({ // 401 Unauthorized for bad credentials
        message: "Kredensial salah atau pengguna tidak ditemukan.",
      });
    }

    // Compare input password with the stored hash (user.user_pass)
    const isMatch = await bcrypt.compare(password, user.user_pass);

    if (!isMatch) {
      return res.status(401).json({ // 401 Unauthorized
        message: "Kredensial salah atau pengguna tidak ditemukan.",
      });
    }

    // --- 4. Check User Status ---
    if (user.user_status !== 'A') {
        return res.status(403).json({ // 403 Forbidden if inactive
            message: "Akun pengguna tidak aktif.",
        });
    }

    // --- 5. Generate JWT ---
    const payload = {
      id: user.id, // Use the user's primary key (usually 'id')
      level: user.user_level // Include level code in payload
      // Add other non-sensitive info if needed (e.g., user_name)
    };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Add expiration!
    );

    // --- 6. Store Token for Revocation Check (Optional but Recommended) ---
    // Save the generated token to the user's record
    user.user_validation = token;
    await user.save();

    // --- 7. Prepare and Send Response ---
    // Exclude sensitive data
    const userData = user.toJSON();
    delete userData.user_pass;
    delete userData.user_validation;
    // If you included associated data: delete userData.role; // or handle as needed

    return res.status(200).json({
      message: "Berhasil login.",
      data: userData, // Send cleaned user data
      token, // Send the token separately
    });

  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({
      message: "Internal server error during signin.",
    });
  }
};

exports.logout = async (req, res) => {
  // --- 1. Get User ID from Middleware ---
  // Assumes your authMiddleware correctly verifies token and attaches user info to req.user
  if (!req.user || !req.user.id) {
    // This usually indicates the authMiddleware didn't run or failed
    return res.status(401).json({ error: "Unauthorized: Sesi tidak valid." });
  }
  const userId = req.user.id;

  try {
    // --- 2. Find User ---
    const user = await userakses.findByPk(userId, {
        attributes: ['id', 'user_validation'] // Only need these fields
    });

    if (!user) {
      // Should be rare if middleware passed, but handle defensively
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    // --- 3. Invalidate Token ---
    // Clear the stored validation token
    user.user_validation = null;
    await user.save();

    // --- 4. Send Response ---
    // Fix syntax: remove extra .res
    return res.status(200).json({
      message: "Berhasil logout.",
    });

  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error during logout.",
    });
  }
};
