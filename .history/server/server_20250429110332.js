require("dotenv").config();
const cors = require("cors");
const http = require("http");
const path = require("path");
const express = require("express");
const bodyparser = require("body-parser");
const authRotes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//Routes auth
app.use("api/auth", authRotes);
app.use("api/pasar", pasarRoutes);
app.use("api/user", )

const PORT = process.env.PORT || 3000;
server.listen(PORT, {})