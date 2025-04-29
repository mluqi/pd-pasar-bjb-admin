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

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

//Routes auth
app.use('api/auth', authRotes)
app.use('a')