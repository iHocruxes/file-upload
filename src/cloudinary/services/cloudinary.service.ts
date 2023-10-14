import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { resolve } from 'path';
const toStream = require('buffer-to-stream')

dotenv.config();

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
            secure: true
        });
    }

    async uploadImage(file: Express.Multer.File, public_id: string) {

        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({
                public_id: public_id,
                overwrite: true,
                folder: '/doctor/avatar'
            }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });

            toStream(file.buffer).pipe(upload);
        });
    }
}