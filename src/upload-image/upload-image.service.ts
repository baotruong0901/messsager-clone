import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { v2 } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadImageService {
    constructor() {
        cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }


    public async uploadFile(
        file: Express.Multer.File,
    ): Promise<{ url: string }> {
        return new Promise((resolve, reject) => {
            const upload = v2.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url });
            });
            Readable.from(file.buffer).pipe(upload);
        });
    }
}


