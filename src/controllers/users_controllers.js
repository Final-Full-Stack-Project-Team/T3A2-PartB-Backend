const User = require('../models/user_model.js')
const bcrypt = require("bcrypt")
const { createToken, verifyToken } = require('../services/auth_services.js')
const nodemailer = require('nodemailer')
require('dotenv').config()

// Endpoint for getting a single user
const getUser = async (request, response) => {
    try{
        let user = await User.findOne({email: request.params.email})
        // If a user is found, return the id and the name only
        if (user) {
            const userData = {
                _id: user._id,
                name: user.name,
                lists: user.lists,
                groups: user.groups,
                email: user.email
            }
            response.send(userData)
        } else {
            // Otherwise, error response
            response.json({ error: "User not found." })
            return
        }
    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.status(404).json({ error: "User not found." })
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
        const userData = users.map(({name, email, lists, groups, _id}) => ({name, email, lists, groups, _id}))
        response.send(userData)

    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

// Endpoint for a user sign up
const signup = async (request, response) => {
    try {
        // Creating the user object
        const { email, password, name } = request.body;

         // Email validation
         const emailValidation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailValidation.test(email)) {
             return response.status(400).json({
                 error: "Email address is not a valid format."
             });
         }

         // Password validation
        const passwordValidation = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordValidation.test(password)) {
            return response.status(400).json({
                error: "Password must contain at least 8 characters, a capital letter, and a number."
            });
        }

        let newUser = new User({
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
            name: name
        });

        // Checking the user email for any existing ones, to then respond with a custom error message
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            response.status(409).json({ error: "A user with that email address already exists." });
            return;
        }
        await newUser.save();

        // Creating a token using the userid and email with a 7 day expiry
        const token = createToken(newUser._id, newUser.email, '7d');

        // Responding with id, name, and the token
        response.json({
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            token: token
        });
    } catch (error) {
        response.status(500).json({ error: error.message });

    }
};

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
                    name: user.name,
                    lists: user.lists,
                    groups: user.groups,
                    email: user.email
                },
                token: token
            })
        } else {
            response.status(401).json({ error: "Incorrect email address or password." })
            return
        }
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
}

// Endpoint for sending out password reset email
const sendEmail = async (email, text, subject, response) => {
    try{

        // Create a transporter object
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'remann12@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Set up email data if the user with supplied email
        const mailOptions = {
            from: 'remann12@gmail.com',
            to: email,
            subject: subject,
            text: text
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
    
    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

/*
const passwordResetEmail = async (request, response) => {
    try{
    const user = await User.findOne({email: request.body.email})

    if (user) {
        // Creating token, only valid for an hour, for the purpose of validating the user when using the link
        const token = createToken(user._id, user.email, '1h')
        const resetLink = `http://localhost:3000/password-reset/${token}/${user._id}`
        const subject = 'Minima-List Password Reset'
        const text = `Please use the following link to reset your password \n ${resetLink}`

        await sendEmail(user.email, text, subject, response)
    
    } else {
        response.status(404).json({error: "User not found"})
    }
    } catch(error) {
        response.status(500).json({ error: error.message })
    }
}

const inviteUserEmail = async (request, response) => {
    try {
      const email = request.body.email;
      const subject = 'Invitation to Minima-List';
      const text = 'Here is your invitation to join';
  
      await sendEmail(email, text, subject, response);
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  };

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
            response.status(404).json({ error: "User not found." })
            return
        }

        response.json({
            message: "Password has been successfully changed."
        })

    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.status(404).json({ error: "User not found." })
        } else {
            response.status(500).json({ error: error.message })
        }
    }
}
*/

module.exports = {
    getUser,
    getAllUsers,
    signup,
    login
}