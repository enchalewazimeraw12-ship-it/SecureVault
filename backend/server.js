import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

fs.mkdirSync(path.resolve('uploads'), { recursive: true });
fs.mkdirSync(path.resolve('encrypted'), { recursive: true });

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('SecureVault AES API Running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));