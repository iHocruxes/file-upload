import { Controller, Get, Post, UseInterceptors, UploadedFile, Body, Put, UseGuards, Param, BadRequestException } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHideProperty, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { DoctorGuard } from "../../auth/guards/doctor.guard";
import { UserGuard } from "../../auth/guards/user.guard";

@ApiTags('CLOUDINARY')
@Controller('avatar')
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService
    ) { }


    @UseGuards(DoctorGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'thêm, cập nhật avatar cho bác sĩ' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'file và public_id phải được truyền vào, file bắt buộc phải là dạng image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'file',
                    format: 'binary',
                    description: 'file ảnh upload',

                },
                public_id: {
                    type: 'string',
                    format: 'string',
                    description: 'đặt tên cho file ảnh',
                    nullable: false
                }
            },
        },
    })
    @Put('doctor')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDoctorAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Body('public_id') public_id: string,
    ) {
        if (!file)
            throw new BadRequestException('file_required')
        if (!public_id)
            throw new BadRequestException('public_id_required')

        return await this.cloudinaryService.uploadImage(file, public_id, '/healthline/avatar/doctors')
    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'thêm, cập nhật avatar cho hồ sơ người dùng' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, description: 'Thành công' })
    @ApiResponse({ status: 400, description: 'file và public_id phải được truyền vào, file bắt buộc phải là dạng image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'file',
                    format: 'binary',
                    description: 'file ảnh upload',

                },
                public_id: {
                    type: 'string',
                    format: 'string',
                    description: 'đặt tên cho file ảnh',
                    nullable: false
                }
            },
        },
    })
    @Put('user')
    @UseInterceptors(FileInterceptor('file'))
    async uploadUserAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Body('public_id') public_id: string,
    ) {
        return await this.cloudinaryService.uploadImage(file, public_id, '/healthline/avatar/users')
    }
}