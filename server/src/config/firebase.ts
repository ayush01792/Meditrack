import admin from 'firebase-admin';
import { env } from './env';

let firebaseInitialized = false;

export function initFirebase() {
  if (
    firebaseInitialized ||
    !env.FIREBASE_PROJECT_ID ||
    !env.FIREBASE_CLIENT_EMAIL ||
    !env.FIREBASE_PRIVATE_KEY ||
    env.FIREBASE_PROJECT_ID === 'your_project_id' ||
    !env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')
  ) {
    console.log('⚠️  Firebase not configured — push notifications disabled');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

  firebaseInitialized = true;
  console.log('✅ Firebase Admin initialized');
}

export function getMessaging() {
  return admin.messaging();
}
