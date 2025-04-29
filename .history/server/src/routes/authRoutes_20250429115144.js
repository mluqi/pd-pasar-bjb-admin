const express = require('express')
const authMiddleware = require('./middlewares/authMiddleware')
const router = express.Router()

const { signin, signup, logout } = require('./controllers/authController')

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/logout', authMiddleware, logout)

router.get('/logout', authMiddleware, profile)

module.exports = router