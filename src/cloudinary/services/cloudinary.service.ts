import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs'

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
        const upload = await cloudinary.uploader.upload(file.path, {
            upload_preset: 'doctor_avatar',
            public_id: public_id,
            api_key: process.env.CLOUDINARY_API_KEY,
        })

        await this.deleteFile(file.path)

        return "successfully"
    }

    async deleteFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }
}