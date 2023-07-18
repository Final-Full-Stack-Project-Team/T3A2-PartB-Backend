const mongoose = require('mongoose')

// Define the Group model using Mongoose
const Group = mongoose.model('Groups', {
    // Represents the name of the group (String type)
    group_name: {
        type: String,
        required: true
    },
    dateCreated: Date,
    // Foreign object of groups that belong to users
    group_members: [{ type: mongoose.Types.ObjectId, ref: 'User' }], 
    
    created_by: {type: mongoose.Types.ObjectId, ref: 'User'}
});

// Export the Group model to be used in other modules
module.exports = Group;