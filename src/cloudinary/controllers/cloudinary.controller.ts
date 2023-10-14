import { Controller, Get, Post, UseInterceptors, UploadedFile, Body } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";

@ApiTags('CLOUDINARY')
@Controller('cloudinary')
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body('public_id') public_id: string,
    ) {
        return {
            data: await this.cloudinaryService.uploadImage(file, public_id)
        }
    }
}