const Group = require('../models/groups_model')

const getGroups = async (request, response) => {
    
    let groups = await Group.find()
    response.send(groups)
}

const createGroup = async (request, response) => {
    let newGroup = new Group({
        group_name: request.body.group_name,
        group_members: request.body.group_members
    })
    await newGroup.save()
    response.status(201)
    response.send(newGroup)
}

const deleteAllGroups = async (request, response) => {
    await Group.deleteMany()
    response.json({
        "message": "All Groups deleted."
    })
}

module.exports = {getGroups, createGroup, deleteAllGroups}