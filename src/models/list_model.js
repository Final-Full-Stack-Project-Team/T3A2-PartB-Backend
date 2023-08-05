const mongoose = require('mongoose')


const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false
    }
})

// Schema for list model
const ListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateCreated: Date,
    isCompleted: Boolean,

    // Referencing the items collection
    items: [ItemSchema],

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