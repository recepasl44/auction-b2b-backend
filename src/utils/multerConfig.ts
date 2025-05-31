import multer from 'multer';
import path from 'path';

function randomName(ext: string) {
  return Date.now().toString(36) + '-' + Math.round(Math.random() * 1e9).toString(36) + ext;
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, randomName(ext));
  }
});

export const upload = multer({ storage });