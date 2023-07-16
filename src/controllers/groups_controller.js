const Group = require('../models/groups_model')

// Function to get all groups 
const getGroups = async (request, response) => {
    // Fetch all groups from the database
    let groups = await Group.find()
    // Send the groups as a response
    response.send(groups)
}

// Function to get a single group by id 
const getGroup = async (request, response) => {
    let group = await Group.findById(request.params.id)
        .catch(error => {
            console.log("Could not find id. Error:\n" + error)
            response.status(404)
            response.json({
                error: "Could not find id in the database."
            })
        })
    response.send(group)
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
    // Get the count of groups before deletion
    const groupCount = await Group.countDocuments({});

    // Delete all groups from the database
    await Group.deleteMany({})

    // Create the message with the count of deleted groups
    let message = "";
    if (groupCount === 0) {
        message = "There are no groups to delete"
    } else {
        message = `Deletion successful. ${groupCount} group${groupCount !== 1 ? 's' : ''} deleted.`;
    }

    // Send a JSON response indicating that all groups have been deleted
    response.json({
        "message": message
    })
}

const deleteGroup = async (request, response) => {
deleteSingleGroup = await Group.findByIdAndDelete(request.params.id)
                    .catch(error => {
                        console.log("Cannot delete. Could not find id. Error:\n" + error)
                        response.status(404)
                        })
if (deleteSingleGroup) {
    response.json ({message: "Group deleted."})
} else {
    response.json ({message: "Cannot delete. Could not find id."})
}
}

// Export the functions to be used in other modules
module.exports = {getGroups, getGroup, createGroup, deleteAllGroups, deleteGroup}