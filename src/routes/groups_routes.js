const express = require('express')
const groupsRouter = express.Router();
const {getGroups, createGroup} = require('../controllers/groups_controller')

groupsRouter.get("/",getGroups)

groupsRouter.post("/",createGroup)

module.exports = groupsRouter
