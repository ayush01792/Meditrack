import { getMessaging } from '../config/firebase';

interface PushPayload {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(payload: PushPayload): Promise<boolean> {
  try {
    await getMessaging().send({
      token: payload.fcmToken,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    return true;
  } catch (err) {
    console.error('FCM send failed:', err);
    return false;
  }
}
