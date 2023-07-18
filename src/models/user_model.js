const mongoose = require('mongoose')

// Create User Schema
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },

    // Foreign object of lists that belong to users
    lists: [{ type: mongoose.Types.ObjectId, ref: 'List' }],
    groups: [{ type: mongoose.Types.ObjectId, ref: 'Group' }]
})

// Attach schema to model
const User = mongoose.model('User', UserSchema)

module.exports = User