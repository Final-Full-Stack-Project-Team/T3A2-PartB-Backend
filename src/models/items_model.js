const mongoose = require('mongoose')

// Schema for list model
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
})

const Item = mongoose.model('Item', ItemSchema)

module.exports = Item