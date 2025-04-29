const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { userakses, user_level } = require('../../models')


exports.signup = async (req, res) => {
    try {
        const {username, password, user_phone, user } = req.body
        
    }
}

exports.signin = async (req, res) => {
    try {
        const {username, password} = req.body
    }
}