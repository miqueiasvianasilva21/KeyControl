import { Router } from 'express';
import * as movementController from './movement.controller';

const movementRouter = Router();

movementRouter.post('/', movementController.create);
movementRouter.get('/', movementController.list);
movementRouter.post("/loss/:id", movementController.reportarPerdaController);

export default movementRouter;