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
            isCompleted: false,
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

const modifyList = async (request, response) => {
    try {
        const listId = request.params._id
        const updatedData = request.body

        const list = await List.findById(listId)
        
        if(!list) {
            throw new Error("List not found")
        }

        Object.keys(updatedData).forEach((key) => {
            if (list[key] !== undefined) {
                list[key] = updatedData[key]
            }
        })

        await list.save()
        response.send(list)
    } catch(error) {
        response.json({
            error: error.message
        })
    }
}

const removeUserFromList = async (request, response) => {
    try {
        const listId = request.params._id
        const userId = request.body.user

        const user = await User.findById(userId)
        const list = await List.findById(listId)

        if (!user) {
            throw new Error("User not found")
        }
        if (!list) {
            throw new Error("List not found")
        }

        if (list.users.length === 0) {
            deleteList(request, response)
            return
        }

        console.log(list.admin == userId)
        if (list.admin == userId) {
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
            
            await List.updateOne(
                {_id: listId},
                { $pull: { users: userId }}
            )
        }

        await User.updateOne(
            {_id: userId},
            { $pull: {lists: listId}}
        )

        response.json({
            message: `${user.name} was removed from the list`
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
    deleteList,
    modifyList,
    removeUserFromList
}