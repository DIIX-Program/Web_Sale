import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Fallback to memory storage if Cloudinary is not configured
  console.warn('⚠️  Cloudinary not configured, using memory storage');
}

// Memory storage for multer (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!process.env.CLOUDINARY_URL) {
    // Return a placeholder URL if Cloudinary is not configured
    return 'https://via.placeholder.com/500';
  }

  return new Promise((resolve, reject) => {
    if (!file.buffer) {
      reject(new Error('File buffer is required'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'web-sale',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    // Create a readable stream from buffer
    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

export default cloudinary;

