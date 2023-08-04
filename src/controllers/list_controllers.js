const List = require('../models/list_model.js')
const User = require('../models/user_model.js')

// Endpoint to find a single list
const getList = async (request, response) => {
    try {
        const userId = request.decodedId
        //Find the list by id from the url parameter
        let list = await List.findOne({
            _id: request.params._id,
            $or: [{admin: userId}, {shared_with: userId}]
        })
        // If list is found, send the list as response
        if (list) {
            response.send(list)
        // Else throw error if list not found
        } else {
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
        const userId = request.decodedId
        const lists = await List.find({
            $or: [
              { admin: userId }, // Lists where the 'admin' field matches the 'userId'
              { shared_with: userId }, // Lists where the 'shared_with' array contains the 'userId'
            ],
          });
        
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

        /*if (existingUsers?.length !== shared_with?.length || !admin) {
          return response.status(404).json({ error: 'One or more users not found' });
        } */

        if (!admin) {
            return response.status(404).json({ error: 'User not found' });
        }

        // New list object being created
        let newList = new List({
            name: request.body.name,
            dateCreated: new Date(),
            isCompleted: false,
            shared_with: [],
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

// End point for adding items, modifying list name and any other data that is not relating to users
const modifyList = async (request, response) => {
    try {
        if (request.body.items) {
            const list = await List.findById(request.params._id)
            const checkIfItemExists = list.items.some((item) => item.toString(request.body))
            if (checkIfItemExists) {
                //response.status(500).json({ error: "NO" })
                //return
                list.items = list.items.filter((item) => item.toString() !== request.body.items[0].toString());
            }
            let existingListItems = list.items
            let newItems = [...existingListItems, ...request.body.items]
            request.body = {...request.body, items: newItems}
        }
        const list = await List.findByIdAndUpdate(request.params._id, request.body, {new: true}).populate('items')
        if(!list) {
            response.status(404).json({ error: "List not found" })
            return
        }
        // Logic to stop users being modified in this endpoint
        if (request.body.hasOwnProperty('shared_with')) {
            response.status(500).json({ error: "Cannot edit users here" })
            return
        }
        response.send(list)
    } catch(error) {
        response.status(500).json({error: error.message})
        console.log(error)
    }
}

// Endpoint for adding a new user to the list
const addUserToList = async (request, response) => {
    try {
        // declare user and list
        const user = await User.findById(request.body.shared_with)
        const list = await List.findById(request.params._id)

        if (request.body.shared_with.length === 0) {
            response.status(200).json({ message: "List updated without new members" })
            return
        }


        if (!user) {
            response.status(404).json({ error: "User not found" })
            return
        }

        if (!list) {
            response.status(404).json({ error: "List not found" })
            return
        }

        // Spread syntax to get an array with the current users in the list
        const usersInList = [...list.shared_with]


        // Checks if the user is already in the list
        const newUsers = request.body.shared_with.filter(
            (userId) => !usersInList.some((listUserId) => listUserId.equals(userId))
        );

        // Push new user into the array of current users
        usersInList.push(...newUsers)

        // Update document using the updated users array
        const updatedList = await List.findByIdAndUpdate(request.params._id, {shared_with: usersInList}, {new: true})
        
        response.status(200).send(updatedList)
    } catch(error) {
        response.status(500).json({error: error.message})
    }
}

// End point to remove users from list
const removeUserFromList = async (request, response) => {
    try {
        // declare values from params and body
        const listId = request.params._id
        const userId = request.body.shared_with
        
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
        if (list.shared_with.length === 0) {
            deleteList(request, response)
            return
        }

        // Logic to run if the admin is being removed from list
        if (list.admin == userId) {
            // Sets new admin to be the first user in the array
            const newAdmin = list.shared_with[0]
            await List.updateOne(
                {_id: listId},
                { $set: {admin: newAdmin._id}}
            )
            await List.updateOne(
                {_id: listId},
                {$pull: { shared_with: newAdmin._id }}
            )
        } else if (list.admin !== user._id) {
            // If user is not admin, then remove the user from the users array
            await List.updateOne(
                {_id: listId},
                { $pull: { shared_with: userId }}
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

// Enpoint to remove items from list
const removeItemFromList = async (request, response) => {
    try {
        const item = request.body.items
        const list = await List.findById(request.params._id)

        if (!item) {
            response.status(404).json({ error: "Item not found" })
            return
        }

        if (!list) {
            response.status(404).json({ error: "List not found" })
            return
        }

        // Checking for an data that is not an item in the request body
        const additionalFields = Object.keys(request.body).filter(field => !'items'.includes(field));
        // If any found, return an error
        if (additionalFields.length > 0) {
            response.status(400).json({ error: "Invalid fields in the request body" });
            return;
        }

        // Update the document
        await List.updateMany(
            {_id: request.params._id},
            { $pull: {items: { $in: item } } }
        )
        // Create new instance of the updated list
        const updatedList = await List.findById(request.params._id)
        // Send updated list
        response.status(200).send(updatedList)

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
    addUserToList,
    removeUserFromList,
    removeItemFromList
}