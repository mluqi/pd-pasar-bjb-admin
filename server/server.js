require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bodyparser = require("body-parser");

// routes
const authRoutes = require("./routes/authRoutes");
const userlevelRoutes = require("./routes/userlevelRoutes");
const pasarRoutes = require("./routes/pasarRoutes");
const userRoutes = require("./routes/userRoutes");
const iuranRoutes = require("./routes/iuranRoutes");
const pedagangRoutes = require("./routes/pedagangRoutes");
const lapakRoutes = require("./routes/lapakRoutes");
const logRoutes = require("./routes/logRoutes");
const menuRoutes = require("./routes/menuRoutes");
require("./services/iuranScheduler");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "*"
}));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/pasar", pasarRoutes);
app.use("/api/level", userlevelRoutes);
app.use("/api/user", userRoutes);

app.use("/api/iuran", iuranRoutes);
app.use("/api/pedagang", pedagangRoutes);
app.use("/api/lapak", lapakRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api", logRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(
    `Server is running on PORT ${PORT}`
  );
});
