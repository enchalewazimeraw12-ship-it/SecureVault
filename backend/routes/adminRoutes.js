import express from 'express';
import {
  deleteAdminFile,
  deleteUser,
  getAdminOverview,
  toggleUserStatus,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/overview', protect, adminOnly, getAdminOverview);
router.patch('/users/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.delete('/files/:id', protect, adminOnly, deleteAdminFile);
export default router;