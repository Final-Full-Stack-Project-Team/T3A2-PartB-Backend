const { response } = require('express');
const Group = require('../models/groups_model');
const User = require('../models/user_model');
const mongoose = require('mongoose');

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
        // If the group is successfully retrived
        response.json(group);
    } else {
        // If the group ID is invalid
        response.json({ message: "Could not find Group ID." });
    };
};


// Function to create a new group
const createGroup = async (request, response) => {
    try {
         // Check if the required fields are empty or missing
        const { group_name, group_members, created_by } = request.body;
       
        // If Group name is empty or consists of only white space(s)
        if (group_name.trim() === "") {
            return response.status(400).json({ error: 'Cannot create Group. Group name cannot be empty' });
        }

        // If Group members is left empty or consists of only white space(s)
        if (!Array.isArray(group_members) || group_members.length === 0 || group_members.every(member => member === "")) {
            return response.status(400).json({ error: 'Cannot create Group. At least one Group member is required' });
        }

        // If the Group's creator is left empty or consists of only white space(s)
        if (created_by.trim() === "") {
            return response.status(400).json({ error: 'Cannot create Group. A Group creator is required' });
        }

        // Check if the created_by user ID exists
        const createdByUser = await User.findById(created_by);
        if (!createdByUser) {
            return response.status(400).json({ error: 'Cannot create Group. Invalid user ID for the creator' });
        }

        // Check if all group_members user IDs exist
        const existingGroupMembers = await User.find({ _id: { $in: group_members } });
        if (existingGroupMembers.length !== group_members.length) {
            return response.status(400).json({ error: 'Cannot create Group. Invalid user ID(s) in group_members' });
        }

        // Create a new group object based on the request body
        let newGroup = new Group({
            group_name: group_name,
            dateCreated: new Date(),
            group_members: group_members,
            created_by: created_by
        });

        // Save the new group to the database
        await newGroup.save();

        // Respond with the newly created group
        response.json(newGroup);
    } catch (error) {
        // If any errors occur
        console.log("Error while creating group:\n", error);
        response.status(500).json({ error: 'An error has occured' });
    }
};

const updateGroup = async (request, response) => {
    try {
        // Check if the required fields are empty or missing
        const { group_name, group_members} = request.body;

        // If group_name is provided, check if it's empty
        if (group_name !== undefined && group_name.trim() === "") {
            return response.status(400).json({ error: 'Cannot edit Group. Group name cannot be empty' });
        }

        // If group_members is provided, check if it's an empty array
        if (group_members !== undefined && (!Array.isArray(group_members) || group_members.length === 0 || group_members.every(member => member === ""))) {
            return response.status(400).json({ error: 'Cannot edit Group. At least one Group member is required' });
        }

        // Check if all group_members user IDs exist
        if (group_members !== undefined) {
            const existingGroupMembers = await User.find({ _id: { $in: group_members } });
            if (existingGroupMembers.length !== group_members.length) {
                return response.status(400).json({ error: 'Cannot edit Group. Invalid user ID(s) in group_members' });
            }
        }

        // Proceed with updating the group if the required fields are valid
        let updatedGroup = await Group.findByIdAndUpdate(request.params.id, request.body, { new: true })
            .catch(error => {
                // Log an error message if the update fails due to an invalid ID
                console.log("Cannot edit Group. Could not find ID. Error:\n" + error);
                // Set the response status to 404 (Not Found)
                response.status(404);
            });

        if (updatedGroup) {
            // If the group is successfully updated, send a JSON response with a success message and the updated data
            response.json(updatedGroup);
        } else {
            // If the group update fails (due to invalid ID), send a JSON response with an error message
            response.json({ message: "Cannot edit Group. Could not find ID." });
        }
    } catch (error) {
        // If any errors occur
        console.log("Error while updadaing group:\n", error);
        response.status(500).json({ error: 'An error has occured' });
    }
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
    try {
        const groupId = request.params.id;
        // Check if the provided ID is a valid MongoDB ObjectID
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return response.status(400).json({ error: 'Cannot delete. Group cannot be found.' });
        }
        // Attempt to find and delete the group with the specified ID
        const deleteSingleGroup = await Group.findByIdAndDelete(groupId);

        if (deleteSingleGroup) {
            // If the group is successfully deleted
            response.json({ message: "Group deleted." });
        } else {
            // If the group deletion fails due to invalid ID
            response.status(404).json({ message: "Cannot delete. Group cannot be found." });
        }
    } catch (error) {
        // Log an error message if the deletion fails due to any other error
        console.log("Error while deleting group:\n", error);
        response.status(500).json({ error: 'An error has occurred' });
    }
};

// Export the functions to be used in other modules
module.exports = {getGroups, getGroup, createGroup, updateGroup, deleteAllGroups, deleteGroup}