const express = require("express")
const { getList, getAllLists, createList } = require("../controllers/list_controllers")
const listRouter = express.Router()

listRouter.get("/", getAllLists)
listRouter.get("/:_id", getList)
listRouter.post("/create", createList)

module.exports = listRouter