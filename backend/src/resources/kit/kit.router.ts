import { Router } from 'express';
import * as kitController from './kit.controller';

const kitRouter = Router();

kitRouter.post('/', kitController.create);
kitRouter.get('/', kitController.list);
kitRouter.put('/:id', kitController.update);
kitRouter.delete('/:id', kitController.remove);

export default kitRouter;