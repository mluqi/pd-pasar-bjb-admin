require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bodyparser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
// const pasarRoutes = require("./routes/pasarRoutes");
// const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//Routes auth
app.use("api/auth", authRoutes);
app.
// app.use("api/pasar", pasarRoutes);
// app.use("api/user", )

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
