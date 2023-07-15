const express = require("express")
const {signup, login, passwordResetEmail, passwordResetPage, passwordResetForm, getUser, getAllUsers} = require("../controllers/UserControllers")
const userRouter = express.Router()

userRouter.get("/", getAllUsers)
userRouter.get("/:_id", getUser)
userRouter.post("/signup", signup)
userRouter.post("/login", login)
userRouter.post("/password-reset-email", passwordResetEmail)
userRouter.get("/password-reset/:token/:_id", passwordResetPage)
userRouter.put("/password-reset/:token/:_id/password-form", passwordResetForm)

module.exports = userRouter