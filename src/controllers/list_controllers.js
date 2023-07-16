const { request } = require('http')
const List = require('../models/list_model.js')
const User = require('../models/user_model.js')

const getList = async (request, response) => {
    try {
        let list = await List.findById(request.params._id)
        if (list) {
            response.send(list)
        }
    } catch(error) {
        if (error.name === "CastError" && error.kind === "ObjectId") {
            response.json({
                error: "User not found"
            })
        } else {
            response.json({
                error: error.message
            })
        }
    }
}

const getAllLists = async (request, response) => {
    try {
        let lists = await List.find()
        response.send(lists)

    } catch(error) {
        response.json({
            error: error.message
        })
    }
}

const createList = async (request, response) => {
    try {
        const admin = await User.findById(request.body.admin)
        const users = request.body.users

        const existingUsers = await User.find({ _id: { $in: users } });
        if (existingUsers.length !== users.length) {
          // Some user IDs do not exist
          return res.status(404).json({ error: 'One or more users not found' });
        } 

        let newList = new List({
            name: request.body.name,
            dateCreated: new Date(),
            users: users,
            admin: admin._id
        })

        await newList.save()

        existingUsers.forEach(async (user) => {
            user.lists.push(newList._id);
            await user.save()
        })

        admin.lists.push(newList._id)
        await admin.save()
        

        response.json(newList)

    } catch(error) {
        response.json({
            error: error.message
        })
    }
}

const deleteList = async (request, response) => {
    try {

        const listId = request.params._id

        await List.deleteOne({ _id: listId })

        await User.updateMany(
            {lists: listId},
            { $pull: {lists: listId}}
        )
        
        response.json({
            message: "list deleted successfully"
        })

    } catch(error) {
        response.json({
            error: error.message
        })
    }
}

module.exports = {
    getList,
    getAllLists,
    createList,
    deleteList
}