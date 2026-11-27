import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let useFirebase = false;

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    db = getFirestore();
    useFirebase = true;
    console.log('✅ Connected to Firebase Firestore');
  } catch (err) {
    console.warn('⚠️ Firebase init failed, using local JSON DB:', err.message);
  }
} else {
  console.log('ℹ️ Firebase env not set -> Using localdb.json');
}

const localDbPath = path.resolve('localdb.json');
const readLocal = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ users: [], files: [], history: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
};
const writeLocal = (data) => fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));

export { db, useFirebase, readLocal, writeLocal };