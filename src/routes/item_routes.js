const express = require("express")
const { getItem, getAllItems, createItem, modifyItem, deleteItem } = require("../controllers/items_controller.js")
const itemRouter = express.Router()

itemRouter.get("/", getAllItems)
itemRouter.get("/:_id", getItem)
itemRouter.post("/create", createItem)
itemRouter.delete("/delete/:_id", deleteItem)
itemRouter.put("/modify/:_id", modifyItem)

module.exports = itemRouter