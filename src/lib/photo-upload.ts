'use client';

import { supabase } from './supabase';

const PHOTO_BUCKET = 'donation-photos';
const FALLBACK_MAX_BYTES = 750 * 1024;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });

export async function uploadDonationPhoto(file: File, donationId: string) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension) ? extension : 'jpg';
  const path = `${donationId}/${crypto.randomUUID()}.${safeExtension}`;

  const upload = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: true,
    });

  if (!upload.error) {
    const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(upload.data.path);
    return { url: data.publicUrl, usedFallback: false };
  }

  if (file.size <= FALLBACK_MAX_BYTES) {
    const dataUrl = await fileToDataUrl(file);
    return {
      url: dataUrl,
      usedFallback: true,
      error: upload.error.message,
    };
  }

  return {
    url: undefined,
    usedFallback: false,
    error: upload.error.message,
  };
}
