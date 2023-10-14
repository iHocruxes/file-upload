import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryController } from './controllers/cloudinary.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    callback(null, file.originalname)
                }
            })
        })
    ],
    controllers: [CloudinaryController],
    providers: [CloudinaryService]
})
export class CloudinaryModule { }
