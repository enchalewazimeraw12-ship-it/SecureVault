import express from 'express';
import {
  encryptFile,
  decryptSavedFile,
  decryptUploadedFile,
  getMyFiles,
  downloadEncryptedFile,
  deleteFile,
  getUserHistory,
} from '../controllers/fileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.post('/encrypt', protect, upload.single('file'), encryptFile);
router.post('/decrypt-upload', protect, upload.single('file'), decryptUploadedFile);
router.post('/decrypt/:id', protect, decryptSavedFile);
router.get('/my-files', protect, getMyFiles);
router.get('/download/:id', protect, downloadEncryptedFile);
router.delete('/:id', protect, deleteFile);
router.get('/history', protect, getUserHistory);
export default router;