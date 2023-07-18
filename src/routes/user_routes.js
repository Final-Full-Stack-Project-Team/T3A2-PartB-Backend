const express = require("express")
const userRouter = express.Router()
const {signup, login, passwordResetEmail, passwordResetPage, passwordResetForm, getUser, getAllUsers} = require("../controllers/users_controllers")

// Define routes for handling user-related operations
userRouter.get("/", getAllUsers)
userRouter.get("/:_id", getUser)
userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.post("/password-reset-email", passwordResetEmail)
userRouter.get("/password-reset/:token/:_id", passwordResetPage)
userRouter.put("/password-reset/:token/:_id/password-form", passwordResetForm)

// Export the userRouter to be used in other modules
module.exports = userRouter