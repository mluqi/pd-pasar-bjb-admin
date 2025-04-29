const express = require('express')
const authMiddleware = require('./middlewares/authMiddleware')
const router = express.Router()

const { signin, signup, profile } = require('./controllers/authController')

router.post('/signup', signup)
router.post('/signin', signin)
router.get('/profile', authMiddleware, profile)

module.exports = router