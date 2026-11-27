import { v4 as uuidv4 } from 'uuid';
import { db, useFirebase, readLocal, writeLocal } from '../services/firebaseService.js';

export const HistoryLogModel = {
  async add({ userId, userEmail, action, fileName, status, details }) {
    const id = uuidv4();
    const log = {
      id,
      userId,
      userEmail,
      action,
      fileName,
      status,
      details,
      timestamp: new Date().toISOString(),
    };
    if (useFirebase) {
      await db.collection('history').doc(id).set(log);
      return log;
    }
    const data = readLocal();
    data.history.push(log);
    writeLocal(data);
    return log;
  },

  async findByUser(userId) {
    if (useFirebase) {
      const snap = await db.collection('history').where('userId', '==', userId).get();
      return snap.docs.map((d) => d.data()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    return readLocal()
      .history.filter((h) => h.userId === userId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async getAll() {
    if (useFirebase) {
      const snap = await db.collection('history').get();
      return snap.docs.map((d) => d.data()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }
    return readLocal().history.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
};