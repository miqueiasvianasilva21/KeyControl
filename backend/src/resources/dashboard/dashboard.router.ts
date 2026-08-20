import { Router } from "express";
import { getDashboardData } from "./dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", getDashboardData);

export default dashboardRouter;