const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { userakses, user_level } = require('../../models')


exports.signup = async (req, res) => {
    try {
        const {username, password, user_phone, user_email, user_level, user_foto, user_owner, user_status } = req.body
        
        if(!username || !password || !user_phone || !user_email || !user_
    }
}

exports.signin = async (req, res) => {
    try {
        const {username, password} = req.body
    }
}