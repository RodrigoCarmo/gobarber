import path from 'path';
import crypto from 'crypto';
import multer, { StorageEngine } from 'multer';

interface IUploadConfig {
  driver: 'S3Storage' | 'diskStorage';

  tmpFolder: string;

  uploadsFolder: string;

  multer: {
    storage: StorageEngine;
  }

  config: {
    diskStorage: {

    },
    aws: {
      bucket: string;
    }
  }
}

const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');



export default {
  driver: process.env.STORAGE_DRIVER,

  tmpFolder,
  uploadsFolder: path.resolve(tmpFolder, 'uploads'),

  multer: {
    storage: multer.diskStorage({
      destination: tmpFolder,
      filename(request, file, callback) {
        const fileHash = crypto.randomBytes(10).toString('HEX');
        const fileName = `${fileHash}-${file.originalname}`;

        return callback(null, fileName);
      },
    }),
  },

  config: {
    diskStorage: {

    },

    aws: {
      bucket: 'app-gobarber-rodrigo',
    }
  }
} as IUploadConfig;
