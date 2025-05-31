// F:\b2b-auction-backend\src\routes\userRoutes.ts
import { Router } from 'express';
import UserManagementController from '../controllers/UserManagementController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { permissionMiddleware } from '../middlewares/permissionMiddleware';

const userRouter = Router();

/**
 * Kullanıcı yönetimi -> genelde admin / superAdmin
 */
userRouter.get('/', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.getAllUsers(req, res));
});

userRouter.get('/:id', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.getUserById(req, res));
});

userRouter.post('/', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.createUser(req, res));
});

userRouter.put('/:id', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.updateUser(req, res));
});

userRouter.put('/:id/password', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.updateUserPassword(req, res));
});

userRouter.delete('/:id', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.deleteUser(req, res));
});

// Ek: approveUser
userRouter.put('/:id/approve', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.approveUser(req, res));
});

// Ek: banUser
userRouter.put('/:id/ban', authMiddleware, permissionMiddleware('admin'), (req, res) => {
  Promise.resolve(UserManagementController.banUser(req, res));
});

export default userRouter;
