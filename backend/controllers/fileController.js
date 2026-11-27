import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { encryptAndSaveToDisk, decryptFromDisk } from '../services/aesService.js';
import { FileRecordModel } from '../models/FileRecord.js';
import { HistoryLogModel } from '../models/HistoryLog.js';

export const encryptFile = async (req, res) => {
  try {
    const file = req.file;
    const { secretKey } = req.body;

    if (!file) return res.status(400).json({ message: 'Please select a file.' });
    if (!secretKey || secretKey.length < 4) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'AES Key must be at least 4 characters.' });
    }

    const encryptedFileName = `${uuidv4()}.enc`;
    const encryptedPath = path.resolve('encrypted', encryptedFileName);

    const encryptedSize = encryptAndSaveToDisk(file.path, encryptedPath, secretKey);
    fs.unlinkSync(file.path); // Delete temp unencrypted file

    const record = await FileRecordModel.create({
      userId: req.user.id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      originalSize: file.size,
      encryptedSize,
      encryptedFileName,
      algorithm: 'AES-256-GCM',
    });

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ENCRYPT',
      fileName: file.originalname,
      status: 'SUCCESS',
      details: `Encrypted with AES-256-GCM (${encryptedSize} bytes)`,
    });

    res.status(201).json({ message: 'File encrypted and saved!', file: record });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
};

export const decryptSavedFile = async (req, res) => {
  let record = null;
  try {
    const { id } = req.params;
    const { secretKey } = req.body;
    record = await FileRecordModel.findById(id);

    if (!record) return res.status(404).json({ message: 'File not found.' });
    if (record.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const encryptedPath = path.resolve('encrypted', record.encryptedFileName);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: 'Encrypted file missing on server.' });
    }

    const decryptedBuffer = decryptFromDisk(encryptedPath, secretKey);

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DECRYPT',
      fileName: record.originalName,
      status: 'SUCCESS',
      details: 'Decrypted saved file from vault',
    });

    const cleanName = record.originalName.replace(/"/g, '');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
    res.setHeader('Content-Type', record.mimeType || 'application/octet-stream');
    res.send(decryptedBuffer);
  } catch (err) {
    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DECRYPT',
      fileName: record ? record.originalName : req.params.id,
      status: 'FAILED',
      details: err.message,
    });
    res.status(400).json({ message: err.message });
  }
};

export const decryptUploadedFile = async (req, res) => {
  try {
    const file = req.file;
    const { secretKey } = req.body;

    if (!file) return res.status(400).json({ message: 'Please upload an encrypted (.enc) file.' });
    if (!secretKey) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Please enter the decryption key.' });
    }

    const decryptedBuffer = decryptFromDisk(file.path, secretKey);
    fs.unlinkSync(file.path);

    const restoredName = (file.originalname.endsWith('.enc')
      ? file.originalname.slice(0, -4)
      : `decrypted-${file.originalname}`
    ).replace(/"/g, '');

    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DECRYPT',
      fileName: restoredName,
      status: 'SUCCESS',
      details: 'Decrypted uploaded .enc file',
    });

    res.setHeader('Content-Disposition', `attachment; filename="${restoredName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decryptedBuffer);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    await HistoryLogModel.add({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DECRYPT',
      fileName: req.file?.originalname || 'Unknown',
      status: 'FAILED',
      details: err.message,
    });
    res.status(400).json({ message: err.message });
  }
};

export const getMyFiles = async (req, res) => {
  const files = await FileRecordModel.findByUser(req.user.id);
  res.json({ files });
};

export const downloadEncryptedFile = async (req, res) => {
  const record = await FileRecordModel.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'File not found.' });
  if (record.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized.' });
  }

  const encryptedPath = path.resolve('encrypted', record.encryptedFileName);
  if (!fs.existsSync(encryptedPath)) {
    return res.status(404).json({ message: 'File missing on server.' });
  }

  res.download(encryptedPath, `${record.originalName}.enc`);
};

export const deleteFile = async (req, res) => {
  const record = await FileRecordModel.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'File not found.' });
  if (record.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized.' });
  }

  const encryptedPath = path.resolve('encrypted', record.encryptedFileName);
  if (fs.existsSync(encryptedPath)) fs.unlinkSync(encryptedPath);
  await FileRecordModel.deleteById(record.id);

  await HistoryLogModel.add({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'DELETE',
    fileName: record.originalName,
    status: 'SUCCESS',
    details: 'Removed encrypted file from vault',
  });

  res.json({ message: 'File deleted.' });
};

export const getUserHistory = async (req, res) => {
  const history = await HistoryLogModel.findByUser(req.user.id);
  res.json({ history });
};