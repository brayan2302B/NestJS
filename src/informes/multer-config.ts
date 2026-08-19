import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/informes',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `informe-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limite del pdf
  },
  fileFilter: (req, anyFile, callback) => {
    if (anyFile.mimetype !== 'application/pdf') {
      return callback(
        new BadRequestException('Solo se permiten archivos PDF'),
        false,
      );
    }
    callback(null, true);
  },
};
