const express = require("express")
const { getList, getAllLists, createList, deleteList, modifyList, removeUserFromList, addUserToList } = require("../controllers/list_controllers")
const listRouter = express.Router()

listRouter.get("/", getAllLists)
listRouter.get("/:_id", getList)
listRouter.post("/create", createList)
listRouter.delete("/delete/:_id", deleteList)
listRouter.put("/modify/:_id", modifyList)
listRouter.put("/addUser/:_id", addUserToList)
listRouter.put("/removeUser/:_id", removeUserFromList)

module.exports = listRouter