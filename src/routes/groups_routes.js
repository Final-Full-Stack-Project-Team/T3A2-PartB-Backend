const express = require('express')
const groupsRouter = express.Router();
const {getGroups, getGroup, createGroup, deleteAllGroups} = require('../controllers/groups_controller')

// Define routes for handling group-related operations
// GET route to retrieve all groups
groupsRouter.get("/", getGroups)
groupsRouter.get("/:id", getGroup)

// POST route to create a new group
groupsRouter.post("/", createGroup)

// DELETE route to delete all groups
groupsRouter.delete ("/delete_all", deleteAllGroups)

// Export the groupsRouter to be used in other modules
module.exports = groupsRouter;