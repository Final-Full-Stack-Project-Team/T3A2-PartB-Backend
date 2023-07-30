const Item = require('../models/items_model.js')
const List = require('../models/list_model.js')

// Endpoint to find a single item
const getItem = async (request, response) => {
    try {
        //Find the item by id from the url parameter
        let item = await Item.findById(request.params._id)
        // If item is found, send the item as response
        if (item) {
            response.send(item)
        // Else throw error if item not found
        } else if (!item) {
            response.status(404).json({error: "Item not found"})
            return
        }
    } catch(error) {
        // If id does not have enough characters, this logic will run
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.json({
                // And response with item not found
                error: "Item not found"
            })
        } else {
            response.status(500).json({
                error: error.message
            })
        }
    }
}

// Endpoint to return all items found
const getAllItems = async (request, response) => {
    try {
        let items = await Item.find()
        response.send(items)

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// Endpoint to return all items found
const getAllItemsFromList = async (request, response) => {
    try {
        let list = await List.findById(request.params._id)

        if (!list) {
            response.status(404).json({ error: "List not found" })
            return
        }

        let itemIds = await list.items
        let items = await Item.find({ _id: { $in: itemIds }})
        response.send(items)

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// Endpoint to create a new item
const createItem = async (request, response) => {
    try {
        // New item object being created
        let newItem = new Item({
            name: request.body.name,
        })

        // Save item to database
        await newItem.save()
        
        // Response with created item
        response.json(newItem)

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// End point for deleting items
const deleteItem = async (request, response) => {
    try {

        // get item id from the params
        const itemId = request.params._id

        // Delete the item matching the itemId
        const item = await Item.findByIdAndDelete( itemId )
        if (!item) {
            response.status(404).json({error: "Item not found"})
            return
        }

        // Update user documents, removing the deleted item
        await List.updateMany(
            {items: itemId},
            { $pull: {items: itemId}}
        )
        
        response.json({
            message: "item deleted successfully"
        })

    } catch(error) {
        response.status(500).json({
            error: error.message
        })
    }
}

// End point for modifying item name and any other data that is not relating to users
const modifyItem = async (request, response) => {
    try {
        const item = await Item.findByIdAndUpdate(request.params._id, request.body, {new: true})
        if(!item) {
            response.status(404).json({ error: "Item not found" })
            return
        }
        response.send(item)
    } catch(error) {
        response.status(500).json({error: error.message})
    }
}

module.exports = {
    getItem,
    getAllItems,
    createItem,
    deleteItem,
    modifyItem,
    getAllItemsFromList
}