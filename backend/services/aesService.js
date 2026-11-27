import crypto from 'crypto';
import fs from 'fs';

const ALGORITHM = 'aes-256-gcm';
const MAGIC = Buffer.from('SVLT'); // 4 bytes signature

export const encryptFileBuffer = (fileBuffer, secretKey) => {
  if (!secretKey || secretKey.length < 4) {
    throw new Error('Encryption key must be at least 4 characters long.');
  }

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(secretKey, salt, 32);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: [SVLT (4B)] + [Salt (16B)] + [IV (12B)] + [AuthTag (16B)] + [Ciphertext]
  return Buffer.concat([MAGIC, salt, iv, authTag, encrypted]);
};

export const decryptFileBuffer = (encryptedBuffer, secretKey) => {
  if (encryptedBuffer.length < 48) {
    throw new Error('Invalid or corrupted encrypted file.');
  }

  const magic = encryptedBuffer.subarray(0, 4);
  if (!magic.equals(MAGIC)) {
    throw new Error('This file was not encrypted by SecureVault.');
  }

  const salt = encryptedBuffer.subarray(4, 20);
  const iv = encryptedBuffer.subarray(20, 32);
  const authTag = encryptedBuffer.subarray(32, 48);
  const ciphertext = encryptedBuffer.subarray(48);

  const key = crypto.scryptSync(secretKey, salt, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('Decryption failed! Incorrect key or corrupted file.');
  }
};

export const encryptAndSaveToDisk = (inputPath, outputPath, secretKey) => {
  const rawBuffer = fs.readFileSync(inputPath);
  const encryptedBuffer = encryptFileBuffer(rawBuffer, secretKey);
  fs.writeFileSync(outputPath, encryptedBuffer);
  return encryptedBuffer.length;
};

export const decryptFromDisk = (encryptedPath, secretKey) => {
  const encryptedBuffer = fs.readFileSync(encryptedPath);
  return decryptFileBuffer(encryptedBuffer, secretKey);
};