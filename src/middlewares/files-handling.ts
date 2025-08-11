import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

export const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, callback) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    callback(null, fileName);
  },
});

export const uploadHandling = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type.'));
    }
  },
}).single('photo');
