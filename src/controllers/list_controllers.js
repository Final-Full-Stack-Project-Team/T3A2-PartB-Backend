const List = require('../models/list_model.js')
const User = require('../models/user_model.js')

// Endpoint to find a single list
const getList = async (request, response) => {
    try {
        //Find the list by id from the url parameter
        let list = await List.findById(request.params._id)
        // If list is found, send the list as response
        if (list) {
            response.send(list)
        // Else throw error if list not found
        } else if (!list) {
            response.status(404).json({error: "List not found"})
            return
        }
    } catch(error) {
        // If id does not have enough characters, this logic will run
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.json({
                // And response with list not found
                error: "List not found"
            })
        } else {
            response.status(500).json({
                error: error.message
            })
        }
    }
}

// Endpoint to return all lists found
const getAllLists = async (request, response) => {
    try {
        let lists = await List.find()
        response.send(lists)

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// Endpoint to create a new list
const createList = async (request, response) => {
    try {
        // Admin gets passed in the json body
        const admin = await User.findById(request.body.admin)
        // Array of users passed in the json body
        const shared_with = request.body.shared_with

        // Looking for users in DB from the id's passed into the users array
        const existingUsers = await User.find({ _id: { $in: shared_with } });
        // If the length of users is not equal to the existing users
        // Then one or more users were not found in the database
        if (existingUsers.length !== shared_with.length || !admin) {
          return response.status(404).json({ error: 'One or more users not found' });
        } 

        // New list object being created
        let newList = new List({
            name: request.body.name,
            dateCreated: new Date(),
            isCompleted: false,
            shared_with: shared_with,
            admin: admin._id
        })

        // Save list to database
        await newList.save()

        // Pushing the new list to each existing user
        existingUsers.forEach(async (user) => {
            user.lists.push(newList._id);
            await user.save()
        })

        // Pushing list to the admin user too
        admin.lists.push(newList._id)
        await admin.save()
        
        // Response with created list
        response.json(newList)

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// End point for deleting lists
const deleteList = async (request, response) => {
    try {

        // get list id from the params
        const listId = request.params._id

        // Delete the list matching the listId
        const list = await List.findByIdAndDelete( listId )
        if (!list) {
            response.status(404).json({error: "list not found"})
            return
        }

        // Update user documents, removing the deleted list
        await User.updateMany(
            {lists: listId},
            { $pull: {lists: listId}}
        )
        
        response.json({
            message: "list deleted successfully"
        })

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// End point for modifying lists
const modifyList = async (request, response) => {
    try {
        const list = await List.findByIdAndUpdate(request.params._id, request.body, {new: true})
        if(!list) {
            response.status(404).json({ error: "List not found" })
            return
        }
        if (request.body.hasOwnProperty('shared_with')) {
            response.status(500).json({ error: "Cannot edit users here" })
            return
        }
        response.send(list)
    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// End point to remove users from list
const removeUserFromList = async (request, response) => {
    try {
        // declare values from params and body
        const listId = request.params._id
        const userId = request.body.user
        
        //declare user and list for error checking
        const user = await User.findById(userId)
        const list = await List.findById(listId)

        // user error checking
        if (!user) {
            response.status(404).json({ error: "User not found" })
            return
        }

        //list error checking
        if (!list) {
            response.status(404).json({ error: "List not found" })
            return
        }

        // If the only user left is the admin which ie getting removed
        // then the list will get deleted
        if (list.users.length === 0) {
            deleteList(request, response)
            return
        }

        // Logic to run if the admin is being removed from list
        if (list.admin == userId) {
            // Sets new admin to be the first user in the array
            const newAdmin = list.users[0]
            await List.updateOne(
                {_id: listId},
                { $set: {admin: newAdmin._id}}
            )
            await List.updateOne(
                {_id: listId},
                {$pull: { users: newAdmin._id }}
            )
        } else if (list.admin !== user._id) {
            // If user is not admin, then remove the user from the users array
            await List.updateOne(
                {_id: listId},
                { $pull: { users: userId }}
            )
        }

        // Update the user document to remove the list from their data
        await User.updateOne(
            {_id: userId},
            { $pull: {lists: listId}}
        )

        response.json({
            message: `${user.name} was removed from the list`
        })

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

module.exports = {
    getList,
    getAllLists,
    createList,
    deleteList,
    modifyList,
    removeUserFromList
}