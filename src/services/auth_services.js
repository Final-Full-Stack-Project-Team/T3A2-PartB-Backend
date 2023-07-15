const { response } = require("express")
const jwt = require("jsonwebtoken")

const createToken = (user_id, email, expire) => {
    try {
        return jwt.sign(
            {
                user_id: user_id,
                email: email
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: expire}
        )
    } catch(error) {
        response.json({
            error: error.message
        })
    }
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (error) {
        throw new Error("Invalid token")
    }
}

module.exports = {
    createToken,
    verifyToken
}