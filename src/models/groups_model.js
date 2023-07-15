const mongoose = require('mongoose')

const Group = mongoose.model('Groups', {
    group_name: String,
    group_members: Array
});

module.exports = Group