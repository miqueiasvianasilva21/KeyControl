import { Response, NextFunction } from "express";
import { AdminRole } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";

export const requireAdminRole =
  (...allowedRoles: AdminRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const adminRole = req.usuario?.role as AdminRole | undefined;

    if (!adminRole || !allowedRoles.includes(adminRole)) {
      return res.status(403).json({
        error: "Você não possui permissão para executar esta operação.",
      });
    }

    next();
  };
