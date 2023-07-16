const express = require("express")
const { getList, getAllLists, createList, deleteList } = require("../controllers/list_controllers")
const listRouter = express.Router()

listRouter.get("/", getAllLists)
listRouter.get("/:_id", getList)
listRouter.post("/create", createList)
listRouter.delete("/delete/:_id", deleteList)

module.exports = listRouter