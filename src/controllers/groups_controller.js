const { response } = require('express');
const Group = require('../models/groups_model');
const User = require('../models/user_model');
const mongoose = require('mongoose');
const { verifyToken } = require('../services/auth_services.js')

const getGroups = async (request, response) => {
    try {
      const userId = request.decodedId; // Assuming this is the user's ID obtained from the decoded token
      const groups = await Group.find({
        $or: [{ admin: userId }, { shared_with: userId }],
      })
      .populate({
        path: 'shared_with',
        select: 'email' // Include only the 'name' property and exclude the '_id' property
      })
      .populate({
        path: 'admin',
        select: 'name email' // Include only the 'name' property and exclude the '_id' property
      })
      .lean(); // Use lean() to return plain JavaScript objects
  
      response.send(groups);
    } catch (error) {
      console.log("Error while fetching groups:\n", error);
      response.status(500).json({ error: 'An error has occurred' });
    }
  };
  

const getGroup = async (request, response) => {
    try {
      const groupId = request.params.id;
      const group = await Group.findById(groupId)
        .populate({
          path: 'shared_with',
          select: 'email' // Include only the 'name' property and exclude the '_id' property
        })
        .populate({
          path: 'admin',
        })
        .lean(); // Use lean() to return plain JavaScript objects
  
      if (group) {
        response.json(group);
      } else {
        response.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      console.log("Error while fetching group:\n", error);
      response.status(500).json({ error: 'An error has occurred' });
    }
  };
  


// Function to create a new group
const createGroup = async (request, response) => {
    try {
        // Extract the user ID of the admin from the decoded token
        const adminId = request.decodedId;

        // Array of users passed in the json body
        const shared_with = request.body.shared_with;

        // Looking for users in DB from the ids passed into the users array
        const existingUsers = await User.find({ _id: { $in: shared_with } });
        // If the length of users is not equal to the existing users
        // Then one or more users were not found in the database
        if (existingUsers.length !== shared_with.length) {
            return response.status(404).json({ error: 'One or more users not found' });
        }

        // If Group name is empty or consists of only white space(s)
        if (request.body.group_name.trim() === "") {
            return response.status(400).json({ error: 'Cannot create Group. Group name cannot be empty' });
        }

        // If shared_with is left empty or consists of only white space(s)
        if (!Array.isArray(shared_with) || shared_with.length === 0 || shared_with.every(member => member === "")) {
            return response.status(400).json({ error: 'Cannot create Group. At least one Group member is required' });
        }

        // Check if the admin ID exists
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            return response.status(400).json({ error: 'Cannot create Group. Invalid user ID for the admin' });
        }

        // Check if all shared_with users IDs exist
        const existingGroupMembers = await User.find({ _id: { $in: shared_with } });
        if (existingGroupMembers.length !== shared_with.length) {
            return response.status(400).json({ error: 'Cannot create Group. Invalid user ID(s) in shared_with' });
        }

        // Create a new group object based on the request body and the extracted admin ID
        let newGroup = new Group({
            group_name: request.body.group_name,
            dateCreated: new Date(),
            shared_with: shared_with,
            admin: adminId // Use the adminId obtained from the decoded token
        });

        // Save the new group to the database
        await newGroup.save();

        // Push the new group's ID to each existing user's groups array
        existingUsers.forEach(async (user) => {
            user.groups.push(newGroup._id);
            await user.save();
        });

        // Push the new group's ID to the admin's groups array too
        adminUser.groups.push(newGroup._id);
        await adminUser.save();

        // Respond with the newly created group
        response.json(newGroup);
    } catch (error) {
        // If any errors occur
        console.log("Error while creating group:\n", error);
        response.status(500).json({ error: 'An error has occurred' });
    }
};


const updateGroup = async (request, response) => {
    try {
        // Check if the required fields are empty or missing
        const { group_name, shared_with} = request.body;

        // If group_name is provided, check if it's empty
        if (group_name !== undefined && group_name.trim() === "") {
            return response.status(400).json({ error: 'Cannot edit Group. Group name cannot be empty' });
        }

        // If group_members is provided, check if it's an empty array
        /*if (shared_with !== undefined && (!Array.isArray(shared_with) || shared_with.length === 0 || shared_with.every(member => member === ""))) {
            return response.status(400).json({ error: 'Cannot edit Group. At least one Group member is required' });
        }*/

        // Check if all group_members user IDs exist
        if (shared_with !== undefined) {
            const existingGroupMembers = await User.find({ _id: { $in: shared_with } });
            if (existingGroupMembers.length !== shared_with.length) {
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
    try {
        // Get all groups before deletion
        const groupsToDelete = await Group.find({});
        const groupCount = groupsToDelete.length;

        // Delete all groups from the database
        await Group.deleteMany({});

        // Delete the associated groups from users
        const groupIds = groupsToDelete.map(group => group._id);
        await User.updateMany(
            { groups: { $in: groupIds } },
            { $pullAll: { groups: groupIds } }
        );

        // Create the message with the count of deleted groups
        let message = "";
        if (groupCount === 0) {
            message = "There are no groups to delete";
        } else { // use plural to display message if the groupCount is not 1
            message = `Deletion successful. ${groupCount} group${groupCount !== 1 ? 's' : ''} deleted.`;
        }

        // Send a JSON response indicating that all groups have been deleted
        response.json({
            "message": message
        });
    } catch (error) {
        // Log an error message if the deletion fails due to any other error
        console.log("Error while deleting groups:\n", error);
        response.status(500).json({ error: 'An error has occurred' });
    }
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

        await User.updateMany(
            {groups: groupId},
            { $pull: {groups: groupId}})

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