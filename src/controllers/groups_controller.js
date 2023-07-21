const { response } = require('express');
const Group = require('../models/groups_model');
const User = require('../models/user_model');

// Function to get all groups 
const getGroups = async (request, response) => {
    // Fetch all groups from the database
    let groups = await Group.find()
    // Send the groups as a response
    response.send(groups)
};

// Function to get a single group by id 
const getGroup = async (request, response) => {
    let group = await Group.findById(request.params.id)
        .catch(error => {
            console.log("Could not find id. Error:\n" + error)
            response.status(404)
        });
    if (group) {
        // If the group is successfully deleted, send a JSON response with a success message
        response.json(group);
    } else {
        // If the group deletion fails (due to invalid ID), send a JSON response with an error message
        response.json({ message: "Cannot delete. Could not find ID." });
    };
};


// Function to create a new group
const createGroup = async (request, response) => {
    try {
        
        const { group_name, group_members, created_by } = request.body;
        // Check if the required fields are empty or missing
        if (!group_name || group_name === " ") {
            return response.status(400).json({ error: 'Cannot create Group. A Group name is required' });
        }

        if (!group_members || group_members === " ") {
            return response.status(400).json({ error: 'Cannot create Group. At least one Group member is required' });
        }

        if (!created_by || created_by === " ") {
            return response.status(400).json({ error: 'Cannot create Group. A Group creator is required' });
        }
        // Create a new group object based on the request body
        let newGroup = new Group({
            group_name: group_name,
            dateCreated: new Date(),
            group_members: group_members,
            created_by: created_by // Assuming the 'created_by' field is an ObjectId referencing the user collection
        });

        // Save the new group to the database
        await newGroup.save();

        // Respond with the newly created group
        response.json(newGroup);
    } catch (error) {
        // Handle errors appropriately
        response.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateGroup = async (request, response) => {
    let updatedGroup = await Group.findByIdAndUpdate(request.params.id, request.body, {new: true})
        .catch(error => {
            // Log an error message if the deletion fails due to an invalid ID
            console.log("Cannot edit Group. Could not find ID. Error:\n" + error);
            // Set the response status to 404 (Not Found)
            response.status(404);
        });
    if (updatedGroup) {
        // If the group is successfully updated, send a JSON response with a success message and the updated data
        response.send (updatedGroup);
    } else {
    // If the group update fails (due to invalid ID), send a JSON response with an error message
        response.json({ message: "Cannot edit Group. Could not find ID." });
    };   
};

// Function to delete all groups
const deleteAllGroups = async (request, response) => {
    // Get the count of groups before deletion
    const groupCount = await Group.countDocuments({});

    // Delete all groups from the database
    await Group.deleteMany({});

    // Create the message with the count of deleted groups
    let message = "";
    if (groupCount === 0) {
        message = "There are no groups to delete"
    } else { // use plural to display message if the groupCount is not 1
        message = `Deletion successful. ${groupCount} group${groupCount !== 1 ? 's' : ''} deleted.`
    };

    // Send a JSON response indicating that all groups have been deleted
    response.json({
        "message": message
    });
};

const deleteGroup = async (request, response) => {
    // Attempt to find and delete the group with the specified ID
    deleteSingleGroup = await Group.findByIdAndDelete(request.params.id)
        .catch(error => {
            // Log an error message if the deletion fails due to an invalid ID
            console.log("Cannot delete. Could not find ID. Error:\n" + error);
            // Set the response status to 404 (Not Found)
            response.status(404);
        });
    if (deleteSingleGroup) {
        // If the group is successfully deleted, send a JSON response with a success message
        response.json({ message: "Group deleted." });
    } else {
        // If the group deletion fails (due to invalid ID), send a JSON response with an error message
        response.json({ message: "Cannot delete. Could not find ID." });
    };
};

// Export the functions to be used in other modules
module.exports = {getGroups, getGroup, createGroup, updateGroup, deleteAllGroups, deleteGroup}