const { verifyToken } = require('../services/auth_services.js')

const validateRequest = (request, response, next) => {
    try {
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(" ")[1]
            if (!token) {
                response.json({ error: "No token received" })
                return
            }
            const decoded = verifyToken(token)
            return next()
        } else {
            response.json({ error: "You are not authenticated for this page" })
            return
        }
    } catch(error) {
        response.json({error: error.message})
    }
}

module.exports = {
    validateRequest
}