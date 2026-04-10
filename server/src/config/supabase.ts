import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export const PRESCRIPTIONS_BUCKET = 'prescriptions';

// Call once on startup to ensure bucket exists
export async function ensureStorageBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === PRESCRIPTIONS_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(PRESCRIPTIONS_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    });
    if (error) {
      console.error('❌ Failed to create storage bucket:', error.message);
    } else {
      console.log('✅ Supabase Storage bucket "prescriptions" created');
    }
  }
}
