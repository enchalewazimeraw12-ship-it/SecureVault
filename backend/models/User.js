import { v4 as uuidv4 } from 'uuid';
import { db, useFirebase, readLocal, writeLocal } from '../services/firebaseService.js';

export const UserModel = {
  async findByEmail(email) {
    const normalized = email.toLowerCase();
    if (useFirebase) {
      const snap = await db.collection('users').where('email', '==', normalized).limit(1).get();
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    const data = readLocal();
    return data.users.find((u) => u.email === normalized) || null;
  },

  async findById(id) {
    if (useFirebase) {
      const doc = await db.collection('users').doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    const data = readLocal();
    return data.users.find((u) => u.id === id) || null;
  },

  async countAll() {
    if (useFirebase) {
      const snap = await db.collection('users').get();
      return snap.size;
    }
    return readLocal().users.length;
  },

  async getAll() {
    if (useFirebase) {
      const snap = await db.collection('users').get();
      return snap.docs.map((d) => {
        const { password, ...rest } = d.data();
        return { id: d.id, ...rest };
      });
    }
    return readLocal().users.map(({ password, ...rest }) => rest);
  },

  async create({ name, email, password, role }) {
    const id = uuidv4();
    const user = {
      id,
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    if (useFirebase) {
      await db.collection('users').doc(id).set(user);
      return user;
    }
    const data = readLocal();
    data.users.push(user);
    writeLocal(data);
    return user;
  },

  async updateStatus(id, status) {
    if (status !== 'active' && status !== 'blocked') {
      throw new Error('User status must be active or blocked.');
    }

    if (useFirebase) {
      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) return null;
      await userRef.update({ status });
      return { id, status };
    }

    const data = readLocal();
    const user = data.users.find((entry) => entry.id === id);
    if (!user) return null;
    user.status = status;
    writeLocal(data);
    return { id, status };
  },

  async deleteById(id) {
    if (useFirebase) {
      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) return false;
      await userRef.delete();
      return true;
    }

    const data = readLocal();
    const users = data.users.filter((user) => user.id !== id);
    if (users.length === data.users.length) return false;
    data.users = users;
    writeLocal(data);
    return true;
  },
};