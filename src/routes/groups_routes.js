const express = require('express')
const groupsRouter = express.Router();
const {getGroups, getGroup, createGroup, updateGroup, deleteAllGroups, deleteGroup} = require('../controllers/groups_controller')

// Define routes for handling group-related operations
// GET route to retrieve all groups
groupsRouter.get("/", getGroups)

groupsRouter.get("/:id", getGroup)

// POST route to create a new group
groupsRouter.post("/", createGroup)

groupsRouter.put("/:id", updateGroup)

// DELETE route to delete all groups
groupsRouter.delete ("/delete_all", deleteAllGroups)

groupsRouter.delete ("/:id", deleteGroup)

// Export the groupsRouter to be used in other modules
module.exports = groupsRouter;