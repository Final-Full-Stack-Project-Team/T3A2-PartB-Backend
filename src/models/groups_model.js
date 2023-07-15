const mongoose = require('mongoose')

// Define the Group model using Mongoose
const Group = mongoose.model('Groups', {
    // Represents the name of the group (String type)
    group_name: String,
    // Represents an array of group members (Array type)         
    group_members: Array       
});

// Export the Group model to be used in other modules
module.exports = Group;