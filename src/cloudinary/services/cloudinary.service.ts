import { BadRequestException, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryOption } from '../../config/database.config';
import { error } from 'console';

const toStream = require('buffer-to-stream')

dotenv.config();

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            ...cloudinaryOption
        });
    }

    async uploadImage(file: Express.Multer.File, public_id: string, folder: string) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({
                public_id: public_id,
                overwrite: true,
                folder: folder,
                resource_type: 'image'

            }, (error, result) => {
                if (error) {
                    return reject(new BadRequestException('invalid_image_file'))
                };
                resolve(result);
            });

            toStream(file.buffer).pipe(upload);
        });
    }

    async uploadFile(file: Express.Multer.File, public_id: string, folder: string) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({
                public_id: public_id,
                overwrite: true,
                folder: folder,
                resource_type: 'auto'

            }, (error, result) => {
                if (error) {
                    return reject(error)
                };
                resolve(result);
            });

            toStream(file.buffer).pipe(upload);
        });
    }

    async deleteFile(public_id: string) {
        return await cloudinary.uploader.destroy(public_id)
    }

}