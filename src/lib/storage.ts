import { supabase } from './supabase';

interface UploadOptions {
  cacheControl?: string;
  upsert?: boolean;
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The bucket name ('vehicle-images' or 'driver-photos')
 * @param path - The path within the bucket (e.g., 'vehicles/bmw-530d.jpg')
 * @param options - Optional upload configuration
 * @returns Public URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: 'vehicle-images' | 'driver-photos' | 'user-photos',
  path: string,
  options: UploadOptions = { cacheControl: '3600', upsert: false }
): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param bucket - The bucket name ('vehicle-images' or 'driver-photos')
 * @param path - The file path to delete
 */
export const deleteImage = async (
  bucket: 'vehicle-images' | 'driver-photos' | 'user-photos',
  path: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Get a public URL for an image
 * @param bucket - The bucket name
 * @param path - The file path
 */
export const getImageUrl = (
  bucket: 'vehicle-images' | 'driver-photos' | 'user-photos',
  path: string
): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * List all files in a bucket
 * @param bucket - The bucket name
 * @param path - Optional path prefix
 */
export const listImages = async (
  bucket: 'vehicle-images' | 'driver-photos' | 'user-photos',
  path?: string
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('List error:', error);
    throw error;
  }
};
