require("dotenv").config()
const cors = require('cors')
const http = require('http')
const path = require('path')
const express = require('express')
const bodyparser = require('body-parser')
const authRotes = require('./routes/authRoutes')

const port = 3000
const app = express()
const server = http.createServer(app)

ap.
