const User = require('../models/user_model.js')
const bcrypt = require("bcrypt")
const { createToken, verifyToken } = require('../services/auth_services.js')
const nodemailer = require('nodemailer')
require('dotenv').config()

const getUser = async (request, response) => {
    try{
        let user = await User.findById(request.params._id)
        if (user) {
            const userData = {
                _id: user._id,
                name: user.name
            }
            response.send(userData)
        } else {
            response.status(404).json({ error: "User not found" })
            return
        }
    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.status(404).json({ error: "User not found" })
        } else {
            response.status(500).json({ error: error.message })
        }
    }
}

const getAllUsers = async (request, response) => {
    try {
        let users = await User.find()
        const userData = users.map(({name, email, lists, _id}) => ({name, email, lists, _id}))
        response.send(userData)

    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

const signup = async (request, response) => {
    try {
            let newUser = new User({
                email: request.body.email,
                password: bcrypt.hashSync(
                    request.body.password,
                    bcrypt.genSaltSync(10)
                ),
                name: request.body.name
            })
            const existingUser = await User.findOne({ email: newUser.email })
            if (existingUser) {
                response.status(409).json({ error: "User with that email already exists" })
                return
            }
            await newUser.save()

            const token = createToken(newUser._id, newUser.email, '7d')

            response.json({
                _id: newUser._id,
                name: newUser.name,
                token: token
            })
    
    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

const login = async (request, response) => {
    const user = await User.findOne({email: request.body.email})
    try {
        if (user && bcrypt.compareSync(request.body.password, user.password)) {
            const token = createToken(user._id, user.email, '7d')
            response.json({
                message: "Login successful",
                data: {
                    _id: user._id,
                    name: user.name
                },
                token: token
            })
        } else {
            response.status(401).json({ error: "Invalid email or password" })
            return
        }
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
}

const passwordResetEmail = async (request, response) => {
    try{
    const user = await User.findOne({email: request.body.email})

    // Create a transporter object
    const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'remann12@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  });

    if (user) {
        // Set up email data
        const token = createToken(user._id, user.email, '1d')
        const mailOptions = {
            from: 'remann12@gmail.com',
            to: user.email,
            subject: 'Password reset link',
            text: `Testing the email sending process \n http://localhost:3000/password-reset/${token}/${user._id}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error)
            } else {
              response.json({
                message: "Email successfully sent"
              })
            }
          });
    

    } else {
        response.status(404).json({error: "User not found"})
    }
    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

const passwordResetPage = async (request, response) => {
    try {
        const user = await User.findById({_id: request.params._id})
        if (!user) {
            response.status(404).json({ error: "User not found" })
            return
        }
        const token = request.params.token
        const decoded = verifyToken(token)
        response.json({
            message: "you are validated to be on this page"
        })

    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.status(404).json({ error: "User not found" })
        } else {
            response.status(500).json({ error: error.message })
        }
    }
}

const passwordResetForm = async (request, response) => {
    try {
        const token = request.params.token
        const decoded = verifyToken(token)
        const password = bcrypt.hashSync(
            request.body.password,
            bcrypt.genSaltSync(10))

        let user = await User.findByIdAndUpdate(request.params._id, { $set: {password: password}}, {new: true})

        if (!request.body.password || request.body.password.length === 0){
            response.status(401).json({ error: "Invalid password" })
            return
        }
        if (!user) {
            response.status(404).json({ error: "User not found" })
            return
        }

        response.json({
            message: "Password has been successfully changed"
        })

    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.status(404).json({ error: "User not found" })
        } else {
            response.status(500).json({ error: error.message })
        }
    }
}

module.exports = {
    getUser,
    getAllUsers,
    signup,
    login,
    passwordResetEmail,
    passwordResetPage,
    passwordResetForm
}