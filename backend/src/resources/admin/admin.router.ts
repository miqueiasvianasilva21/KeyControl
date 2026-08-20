import { Router } from "express";
import { 
  handleCreateAdmin, 
  handleGetAdmins, 
  handleUpdateAdmin, 
  handleDeleteAdmin 
} from "./admin.controller";

const adminRouter = Router();
adminRouter.post("/", handleCreateAdmin);
adminRouter.get("/", handleGetAdmins);
adminRouter.put("/:id", handleUpdateAdmin);
adminRouter.delete("/:id", handleDeleteAdmin);



export default adminRouter;
