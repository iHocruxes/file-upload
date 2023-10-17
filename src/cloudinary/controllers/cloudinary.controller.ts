import { Controller, UseInterceptors, UploadedFile, Body, Put, UseGuards, Req, BadRequestException, Delete, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHideProperty, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { DoctorGuard } from "../../auth/guards/doctor.guard";
import { UserGuard } from "../../auth/guards/user.guard";

@ApiTags('CLOUDINARY')
@Controller()
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService
    ) { }


    @UseGuards(DoctorGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'thêm, cập nhật avatar cho bác sĩ', description: '/healthline/doctors/:id/:avatar' })
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
            },
        },
    })
    @Put('doctor/avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDoctorAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Req() req
    ) {
        if (!file)
            throw new BadRequestException('file_required')

        const size = await this.cloudinaryService.convertByte(file.size)

        const data = await this.cloudinaryService.uploadImage(file, 'avatar', '/healthline/doctors/' + req.user.id)

        return {
            data,
            size
        }
    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'thêm, cập nhật avatar cho hồ sơ người dùng', description: '/heathline/users/:id/avatars/:avatar' })
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
    @Put('user/avatar')
    @UseInterceptors(FileInterceptor('file'))
    async uploadUserAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Body('public_id') public_id: string,
        @Req() req
    ) {
        const data = await this.cloudinaryService.uploadImage(file, public_id, '/healthline/users/' + req.user.id + '/avatars')
        const size = await this.cloudinaryService.convertByte(file.size)

        return {
            data,
            size
        }
    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'thêm, cập nhật medical_record cho hồ sơ người dùng', description: '/healhtline/users/:id/records/:record' })
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
                    description: 'file upload',

                },
                folder: {
                    type: 'string',
                    format: 'string',
                    description: 'đặt tên cho folder',
                    nullable: true
                }
            },
        },
    })
    @Put('user/record')
    @UseInterceptors(FileInterceptor('file'))
    async uploadUserRecord(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder: string,
        @Req() req
    ) {
        const size = await this.cloudinaryService.convertByte(file.size)

        if (!folder)
            folder = '/default'
        else
            folder = '/' + folder

        const data = await this.cloudinaryService.uploadFile(file, '/healthline/users/' + req.user.id + '/records' + folder)

        return {
            data,
            size
        }

    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'xóa thư mục và tất cả tài liệu trong medical_record của người dùng' })
    @Delete('user/record/:folder')
    async deleteUserFolder(
        @Param('folder') folder: string,
        @Req() req
    ) {
        if (!folder)
            folder = '/default'
        else
            folder = '/' + folder

        const path = 'healthline/users/' + req.user.id + '/records' + folder

        return await this.cloudinaryService.deleteFolder(path)
    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa tài liệu từ thư mục trong medical_record' })
    @Delete('user/record/:folder/:public_id')
    async deleteUserRecord(
        @Param('public_id') public_id: string,
        @Param('folder') folder: string,
        @Req() req
    ) {
        if (!folder)
            folder = '/default'
        else
            folder = '/' + folder

        const path = 'healthline/users/' + req.user.id + '/records' + folder + '/' + public_id

        return await this.cloudinaryService.deleteFile(path)
    }
}