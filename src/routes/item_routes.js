const express = require("express")
const { getItem, getAllItems, createItem, modifyItem, deleteItem, getAllItemsFromList } = require("../controllers/items_controller.js")
const itemRouter = express.Router()

itemRouter.get("/", getAllItems)
itemRouter.get("/:_id", getItem)
itemRouter.post("/create", createItem)
itemRouter.delete("/delete/:_id", deleteItem)
itemRouter.put("/modify/:_id", modifyItem)
itemRouter.get("/list/:_id", getAllItemsFromList)

module.exports = itemRouter