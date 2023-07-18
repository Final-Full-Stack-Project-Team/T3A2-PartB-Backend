const express = require('express')
const groupsRouter = express.Router();
const {getGroups, getGroup, createGroup, updateGroup, deleteAllGroups, deleteGroup} = require('../controllers/groups_controller')

// Define routes for handling group-related operations
groupsRouter.get("/", getGroups)
groupsRouter.get("/:id", getGroup)
groupsRouter.post("/", createGroup)
groupsRouter.put("/:id", updateGroup)
groupsRouter.delete ("/delete_all", deleteAllGroups)
groupsRouter.delete ("/:id", deleteGroup)

// Export the groupsRouter to be used in other modules
module.exports = groupsRouter;