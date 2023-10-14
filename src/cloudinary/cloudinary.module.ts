import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryController } from './controllers/cloudinary.controller';

@Module({
    imports: [

    ],
    controllers: [CloudinaryController],
    providers: [CloudinaryService]
})
export class NestCloudinaryModule { }
