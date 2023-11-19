import { BadRequestException, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryOption } from '../../config/database.config';

const toStream = require('buffer-to-stream')

dotenv.config();

@Injectable()
export class CloudinaryService {
    constructor(
    ) {
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
                resource_type: 'image',
                invalidate: true
            }, (error, result) => {
                if (error) {
                    return reject(new BadRequestException('invalid_image_file'))
                };
                resolve(result);
            });

            toStream(file.buffer).pipe(upload);
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream({
                overwrite: true,
                public_id: file.originalname,
                folder: folder,
                resource_type: 'auto',
                invalidate: true,
                use_filename: true
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
        console.log(public_id)
        const result = await cloudinary.uploader.destroy(public_id)
        if(result.result === "ok")
            return true
        return false
    }

    async deleteFolder(folder: string) {
        await cloudinary.api.delete_resources_by_prefix(folder, {
            resource_type: 'video'
        })

        await cloudinary.api.delete_resources_by_prefix(folder, {
            resource_type: 'image'
        })

        await cloudinary.api.delete_resources_by_prefix(folder, {
            resource_type: 'raw'
        })

        return await cloudinary.api.delete_folder(folder)
    }

    async slashFolder(folder: string) {
        const slash = folder.includes('/') ? true : false
        if (slash)
            throw new BadRequestException('slash_found')
        return 0
    }
}