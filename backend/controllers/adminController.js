import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UserModel } from '../models/User.js';
import { FileRecordModel } from '../models/FileRecord.js';
import { HistoryLogModel } from '../models/HistoryLog.js';

const encryptedDirectory = fileURLToPath(new URL('../encrypted/', import.meta.url));

const getEncryptedPath = (fileName) => {
  if (typeof fileName !== 'string' || path.basename(fileName) !== fileName || path.extname(fileName) !== '.enc') {
    throw new Error('Invalid encrypted file name.');
  }
  return path.join(encryptedDirectory, fileName);
};

const removeEncryptedFile = (file) => {
  const encryptedPath = getEncryptedPath(file.encryptedFileName);
  if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
};

export const getAdminOverview = async (req, res) => {
  const [users, files, history] = await Promise.all([
    UserModel.getAll(),
    FileRecordModel.getAll(),
    HistoryLogModel.getAll(),
  ]);
  const usersById = new Map(users.map((user) => [user.id, user]));
  const filesWithOwners = files.map((file) => ({
    ...file,
    ownerEmail: usersById.get(file.userId)?.email || 'Unknown user',
  }));
  res.json({ users, files: filesWithOwners, history });
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(403).json({ message: 'You cannot modify your own administrator account.' });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const status = user.status === 'blocked' ? 'active' : 'blocked';
    const updatedUser = await UserModel.updateStatus(id, status);
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: status === 'blocked' ? 'BLOCK_USER' : 'UNBLOCK_USER',
      fileName: user.email,
      status: 'SUCCESS',
      details: `${status === 'blocked' ? 'Blocked' : 'Unblocked'} user ${user.email}.`,
    });

    res.json({ message: `User ${status}.`, user: { id, status } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(403).json({ message: 'You cannot delete your own administrator account.' });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const files = await FileRecordModel.findByUser(id);
    for (const file of files) {
      removeEncryptedFile(file);
      await FileRecordModel.deleteById(file.id);
    }

    const deleted = await UserModel.deleteById(id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DELETE_USER',
      fileName: user.email,
      status: 'SUCCESS',
      details: `Deleted user ${user.email} and ${files.length} encrypted file(s).`,
    });

    res.json({ message: 'User and their encrypted files deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAdminFile = async (req, res) => {
  try {
    const file = await FileRecordModel.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found.' });

    removeEncryptedFile(file);
    await FileRecordModel.deleteById(file.id);

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ADMIN_DELETE_FILE',
      fileName: file.originalName,
      status: 'SUCCESS',
      details: `Removed encrypted file owned by ${file.userId}.`,
    });

    res.json({ message: 'Encrypted file deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};