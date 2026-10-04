const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/* Uploads one image to Cloudinary and returns its https link. */
export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('The image is too big. Please use one under 5 MB.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', PRESET);

  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body,
    });
  } catch {
    throw new Error('Could not reach the image server. Check your internet.');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Upload failed. Please try again.');
  return data.secure_url;
}