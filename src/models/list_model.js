const mongoose = require('mongoose')

// Schema for list model
const ListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateCreated: Date,
    isCompleted: Boolean,

    // Referencing the items collection
    items: [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'Item' }],

    // Referencing the users collection
    shared_with: [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'User' 
    }],
    // Referencing a user as the admin of the list
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const List = mongoose.model('List', ListSchema)

module.exports = List