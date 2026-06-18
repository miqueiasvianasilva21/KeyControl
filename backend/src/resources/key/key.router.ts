import { Router } from 'express';
import * as keyController from './key.controller';

const keyRouter = Router();


keyRouter.post('/', keyController.create);
keyRouter.get('/', keyController.list);
// Adicione junto com as suas outras rotas de chaves
keyRouter.patch("/:id/restore", keyController.recuperarChaveController); 
// Se você usa o verifyToken nesse router, lembre-se de incluí-lo: 
// keyRouter.patch("/:id/restore", verifyToken, recuperarChaveController);


keyRouter.put('/:id', keyController.update);
keyRouter.delete('/:id', keyController.remove);

export default keyRouter;