import { Router } from 'express';
import * as userController from './user.controller';

const userRouter = Router();

userRouter.post('/', userController.create);
userRouter.get('/', userController.list);
userRouter.put('/:id', userController.update);
userRouter.delete('/:id', userController.remove);

export default userRouter;