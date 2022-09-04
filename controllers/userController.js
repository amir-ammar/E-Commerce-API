
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createToken, checkPermission } = require('../utils')    

const getAllUsers = async (req, res) => {
    console.log(req.user);
    const users = await User.find({ role: 'user'}).select('-password')
    res.status(StatusCodes.OK).json({ users })

}


const getSingleUser = async (req, res) => {

    const userID = req.params.id
    const user = await User.findOne({ _id: userID }).select('-password')

    if (!user) throw new CustomError.NotFoundError(`No user with id ${userID}`)

    checkPermission(req.user, user._id)

    res.status(StatusCodes.OK).json({ user })
}


const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}


const updateUser = async (req, res) => {
    
    const { name, email } = req.body
    
    if (!name || !email) {
        throw new CustomError.BadRequestError('Please provide both name and email')
    }

    
    const user = await User.findByIdAndUpdate(
        { _id: req.user.userId },
        { name, email },
        { new: true, runValidators: true }
    ) 
    
    const tokenUser = createToken(user)
    attachCookiesToResponse({ res, tokenUser })

    res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
    
    const { oldPassword, newPassword } = req.body
    
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide old password and the new one')
    }
    
    const user = await User.findOne({ _id: req.user.userId })
    const isMatch = await user.comparePassword(oldPassword)

    if (!isMatch) {
        throw new CustomError.UnauthenticatedError('Invalid credentials')
    }
    
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({ msg: `Success! Password Updated` })
}


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
}