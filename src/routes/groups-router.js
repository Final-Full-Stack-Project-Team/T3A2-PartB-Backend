const express = require('express')
const groupsRouter = express.Router();

groupsRouter.get("/", (request, response) => {
    response.json(
        {"message": "groups go here"}
    )
})

groupsRouter.post("/", (request, response) => {
    response.json(
        {"group1": {
            "id": 1,
            "group_owner": "owner1@email.com",
            "group_name": "Demo group 1",
            "group_members": {
                "member1": "example1@email.com",
                "member2": "example2@email.com",
                "member3": "example3@email.com",
                "member4": "example4@email.com"
            }
        }}
    )
})

module.exports = groupsRouter
