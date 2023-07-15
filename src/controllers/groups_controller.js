const getGroups = (request, response) => {
    response.json(
        {"message": "groups go here"}
    )
}

const createGroup = (request, response) => {
    response.json(
        {"group1": {
            "group_id": 1,
            "user_id": 1,
            "group_name": request.body.group_name,
            "group_members": request.body.group_members
        }}
    )
}

module.exports = {getGroups, createGroup}