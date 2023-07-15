const express = require('express')
const groupsRouter = express.Router();
const {getGroups, createGroup, deleteAllGroups} = require('../controllers/groups_controller')

groupsRouter.get("/",getGroups)

groupsRouter.post("/",createGroup)

groupsRouter.delete ("/delete_all",deleteAllGroups)

module.exports = groupsRouter
