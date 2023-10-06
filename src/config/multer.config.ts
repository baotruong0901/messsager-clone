import { extname } from 'path';
import { HttpException } from '@nestjs/common';

// Multer upload options
export const multerOptions = {

    // Enable file size limits
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    // Check the mimetypes to allow for upload
    fileFilter: (req: any, file: any, cb: any) => {

        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, 400), false);
        }
    }
};
