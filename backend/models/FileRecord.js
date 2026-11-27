import { v4 as uuidv4 } from 'uuid';
import { db, useFirebase, readLocal, writeLocal } from '../services/firebaseService.js';

export const FileRecordModel = {
  async create(record) {
    const id = uuidv4();
    const newDoc = { id, ...record, createdAt: new Date().toISOString() };
    if (useFirebase) {
      await db.collection('files').doc(id).set(newDoc);
      return newDoc;
    }
    const data = readLocal();
    data.files.push(newDoc);
    writeLocal(data);
    return newDoc;
  },

  async findByUser(userId) {
    if (useFirebase) {
      const snap = await db.collection('files').where('userId', '==', userId).get();
      return snap.docs.map((d) => d.data()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return readLocal()
      .files.filter((f) => f.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async findById(id) {
    if (useFirebase) {
      const doc = await db.collection('files').doc(id).get();
      return doc.exists ? doc.data() : null;
    }
    return readLocal().files.find((f) => f.id === id) || null;
  },

  async getAll() {
    if (useFirebase) {
      const snap = await db.collection('files').get();
      return snap.docs.map((d) => d.data());
    }
    return readLocal().files;
  },

  async deleteById(id) {
    if (useFirebase) {
      await db.collection('files').doc(id).delete();
      return true;
    }
    const data = readLocal();
    data.files = data.files.filter((f) => f.id !== id);
    writeLocal(data);
    return true;
  },
};