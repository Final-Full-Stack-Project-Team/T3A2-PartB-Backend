const Group = require('../models/groups_model')

const getGroups = (request, response) => {
    response.json(
        {"message": "groups go here"}
    )
}

const createGroup = (request, response) => {
    let newGroup = new Group({
        group_name: request.body.group_name,
        group_members: request.body.group_members
    })
    newGroup.save()
    response.json({
        group: newGroup
    })
}

module.exports = {getGroups, createGroup}