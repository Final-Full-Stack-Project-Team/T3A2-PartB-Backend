const Group = require('../models/groups_model')

// Function to get all groups
const getGroups = async (request, response) => {
    // Fetch all groups from the database
    let groups = await Group.find()
    // Send the groups as a response
    response.send(groups)
}

// Function to create a new group
const createGroup = async (request, response) => {
    // Create a new group object based on the request body
    let newGroup = new Group({
        group_name: request.body.group_name,
        group_members: request.body.group_members
    })
    // Save the new group to the database
    await newGroup.save()
    // Set the response status to 201 (Created) and send the new group as a response
    response.status(201)
    response.send(newGroup)
}

// Function to delete all groups
const deleteAllGroups = async (request, response) => {
    // Delete all groups from the database
    await Group.deleteMany()
    // Send a JSON response indicating that all groups have been deleted
    response.json({
        "message": "All Groups deleted."
    })
}

// Export the functions to be used in other modules
module.exports = {getGroups, createGroup, deleteAllGroups}