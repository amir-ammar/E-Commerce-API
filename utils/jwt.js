const jwt = require('jsonwebtoken')


const createJWT = ({payload}) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
}

const isTokenValid = ({token}) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

const attachCookiesToResponse = ({res, tokenUser}) => {

    const token = createJWT({payload: tokenUser })
    const oneDay = 1000 * 60 * 60 * 24
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        signed: true,
        secure: process.env.NODE_ENV === 'production'
    })
}


module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
}