
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors/index')
const { attachCookiesToResponse, createToken } = require('../utils')

const register = async (req, res) => {
    
    const { name, email, password } = req.body

    const emailAlreadyExist = await User.findOne({ email })
    
    if (emailAlreadyExist) {
        throw new CustomError.BadRequestError('This email already in use please provide a valid one')
    }
    
    // check is this is the first account
    const isFirstAccount = await User.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'user'
    const user = await User.create({ name, email, password, role })

    const tokenUser = createToken(user)

    attachCookiesToResponse({ res, tokenUser })
    res.status(StatusCodes.CREATED).json({ user: tokenUser })
}


const login = async (req, res) => {
    const { email, password } = req.body
    
    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide both email and password')
    }

    const user = await User.findOne({ email })
    if (user) {
    
        const isPasswordCorrect = await user.comparePassword(password)
        if (isPasswordCorrect) {

            const tokenUser = createToken(user)

            attachCookiesToResponse({ res, tokenUser })
            res.status(StatusCodes.CREATED).json({ user: tokenUser })
        }
        else throw new CustomError.UnauthenticatedError('Invalid Credentials')
    } else {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
}


const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({ msg: 'User logged out!' })
}

module.exports = {
    register,
    login,
    logout,
}