import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Upload a photo to Supabase Storage bucket 'photos'.
 * Returns the public URL on success, or null if Supabase is not configured
 * (the app will fall back to base64 data URLs in that case).
 */
export async function uploadPhoto(file: File, profId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${profId}-${Date.now()}.${fileExt}`;
    const filePath = `profs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[uploadPhoto] Upload failed:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn('[uploadPhoto] Unexpected error:', err);
    return null;
  }
}
