import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
} from "./item.controller";

const itemRouter = Router();

itemRouter.post("/", createItem);
itemRouter.get("/", getAllItems);
itemRouter.get("/:id", getItemById);
itemRouter.put("/:id", updateItem);
itemRouter.delete("/:id", deleteItem);

export default itemRouter;