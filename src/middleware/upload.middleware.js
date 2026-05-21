import multer from 'multer';
import path from 'path';

const uploadDir = path.resolve('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

export const upload = multer({ storage });
