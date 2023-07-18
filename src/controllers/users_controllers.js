const User = require('../models/user_model.js')
const bcrypt = require("bcrypt")
const { createToken, verifyToken } = require('../services/auth_services.js')
const nodemailer = require('nodemailer')
require('dotenv').config()

// Endpoint for getting a single user
const getUser = async (request, response) => {
    try{
        let user = await User.findById(request.params._id)
        // If a user is found, return the id and the name only
        if (user) {
            const userData = {
                _id: user._id,
                name: user.name,
                lists: user.lists
            }
            response.send(userData)
        } else {
            // Otherwise, error response
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

// Endpoint to display all users
const getAllUsers = async (request, response) => {
    try {
        let users = await User.find()
        // Only sending non sensitive data
        const userData = users.map(({name, email, lists, _id}) => ({name, email, lists, _id}))
        response.send(userData)

    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

// Endpoint for a user sign up
const signup = async (request, response) => {
    try {
            // Creating the user object
            let newUser = new User({
                email: request.body.email,
                password: bcrypt.hashSync(
                    request.body.password,
                    bcrypt.genSaltSync(10)
                ),
                name: request.body.name
            })
            // Checking the user email for any existing ones, to then respond with a custom error message
            const existingUser = await User.findOne({ email: newUser.email })
            if (existingUser) {
                response.status(409).json({ error: "User with that email already exists" })
                return
            }
            await newUser.save()

            // Creating a token using the userid and email with a 7 day expiry
            const token = createToken(newUser._id, newUser.email, '7d')

            // Responding with id, name and the token 
            response.json({
                _id: newUser._id,
                name: newUser.name,
                token: token
            })
    
    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

// Endpoint for logging in
const login = async (request, response) => {
    const user = await User.findOne({email: request.body.email})
    try {
        // Using bcrypt, checking if the user exists and that the password is valid
        if (user && bcrypt.compareSync(request.body.password, user.password)) {
            // If successful, create a toke
            const token = createToken(user._id, user.email, '7d')
            response.json({
                // returning the user id, name and token
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

// Endpoint for sending out password reset email
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
        // Set up email data if the user with supplied email exists
        // Creating token, only valid for an hour, for the purpose of validating the user when using the link
        const token = createToken(user._id, user.email, '1h')
        const mailOptions = {
            from: 'remann12@gmail.com',
            to: user.email,
            subject: 'Password reset link',
            // Link will contain a valid token and user id for added security
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

// Endpoint for checking validations when the user uses the password reset link to enter the reset page
const passwordResetPage = async (request, response) => {
    try {
        // Check the the user id in params is valid
        const user = await User.findById({_id: request.params._id})
        if (!user) {
            response.status(404).json({ error: "User not found" })
            return
        }
        const token = request.params.token
        // Check that the token from the url params is also valid
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

// Endpoint for the password reset form after being validated on the page
const passwordResetForm = async (request, response) => {
    try {
        // Checking the token again for added security
        const token = request.params.token
        const decoded = verifyToken(token)
        // Creating new password
        const password = bcrypt.hashSync(
            request.body.password,
            bcrypt.genSaltSync(10))
        
        // Setting the new password to the user from the params of the url again.
        // Uses url params again for added security
        let user = await User.findByIdAndUpdate(request.params._id, { $set: {password: password}}, {new: true})

        // If no or empty password is supplied, then error is thrown
        if (!request.body.password || request.body.password.length === 0){
            response.status(401).json({ error: "Invalid password" })
            return
        }

        // Error thrown if user id from url params does not exist
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