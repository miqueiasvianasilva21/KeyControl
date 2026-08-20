import { Router } from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemStatus,
  searchItemByCode
} from "./item.controller";

const itemRouter = Router();
itemRouter.get("/search", searchItemByCode);
itemRouter.post("/", createItem);
itemRouter.get("/", getAllItems);
itemRouter.get("/:id", getItemById);
itemRouter.put("/:id", updateItem);
itemRouter.delete("/:id", deleteItem);
itemRouter.patch("/:id/status", updateItemStatus);


export default itemRouter;