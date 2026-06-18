import { Router } from "express";
import { loginController, logoutController } from "./auth.controller";

const router = Router();

// Rota para fazer o login (Gera o Cookie)
router.post("/login", loginController);

// Rota para fazer logout (Limpa o Cookie)
router.post("/logout", logoutController);

export default router;