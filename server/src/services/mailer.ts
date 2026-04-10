import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: parseInt(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail(options: MailOptions): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('⚠️  SMTP not configured — skipping email');
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    ...options,
  });
}

export function reminderEmailHtml(medicineName: string, dosage: string, scheduledAt: Date): string {
  const time = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#2563eb;padding:16px 20px;border-radius:8px;text-align:center;margin-bottom:20px;">
        <h2 style="color:#fff;margin:0;font-size:18px;">💊 Medicine Reminder</h2>
      </div>
      <p style="font-size:15px;color:#374151;">It's time to take your medicine:</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${medicineName}</p>
        <p style="margin:6px 0 0;color:#6b7280;font-size:14px;">${dosage} · Scheduled at ${time}</p>
      </div>
      <p style="font-size:13px;color:#9ca3af;text-align:center;margin-top:24px;">
        MediTrack — Your Health Companion
      </p>
    </div>
  `;
}

export function weeklySummaryEmailHtml(
  userName: string,
  adherenceRate: number,
  taken: number,
  missed: number
): string {
  const color = adherenceRate >= 80 ? '#22c55e' : adherenceRate >= 50 ? '#f59e0b' : '#ef4444';
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px;">
      <div style="background:#2563eb;padding:16px 20px;border-radius:8px;text-align:center;margin-bottom:20px;">
        <h2 style="color:#fff;margin:0;font-size:18px;">📊 Weekly Health Summary</h2>
      </div>
      <p style="font-size:15px;color:#374151;">Hi ${userName}, here's your week at a glance:</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:16px 0;">
        <div style="text-align:center;">
          <p style="font-size:40px;font-weight:700;color:${color};margin:0;">${adherenceRate}%</p>
          <p style="color:#6b7280;font-size:14px;margin:4px 0 0;">Adherence Rate</p>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <div style="display:flex;justify-content:space-around;text-align:center;">
          <div>
            <p style="font-size:24px;font-weight:600;color:#22c55e;margin:0;">${taken}</p>
            <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">Doses Taken</p>
          </div>
          <div>
            <p style="font-size:24px;font-weight:600;color:#ef4444;margin:0;">${missed}</p>
            <p style="font-size:13px;color:#6b7280;margin:4px 0 0;">Doses Missed</p>
          </div>
        </div>
      </div>
      <p style="font-size:13px;color:#9ca3af;text-align:center;margin-top:24px;">
        MediTrack — Your Health Companion
      </p>
    </div>
  `;
}
