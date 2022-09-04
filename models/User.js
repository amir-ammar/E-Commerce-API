
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide user name'],
        minlength: 3,
        maxlenth: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide user email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide user password'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
})

UserSchema.pre('save', async function() {
    if (!this.modifiedPaths('password')) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function(canditatePassword) {
    return await bcrypt.compare(canditatePassword, this.password)
}


module.exports = mongoose.model('User', UserSchema)