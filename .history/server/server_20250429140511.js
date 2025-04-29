require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bodyparser = require("body-parser");
const authRoutes = require("./src/routes/authRoutes");
// const pasarRoutes = require("./routes/pasarRoutes");
// const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//Routes auth
app.use("api/auth", authRoutes);
// app.use("api/pasar", pasarRoutes);
// app.use("api/user", )

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})