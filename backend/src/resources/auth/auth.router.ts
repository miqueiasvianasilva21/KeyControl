import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
} from "./auth.controller";
import { verificarToken } from "../middlewares/auth.middleware";
import { loginRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();


router.post("/login", loginRateLimiter, loginController);


router.post("/logout", logoutController);
router.get("/me", verificarToken, meController);

export default router;
