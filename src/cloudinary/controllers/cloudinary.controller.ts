import { Controller, Inject, UseInterceptors, UploadedFile, Body, Put, UseGuards, Req, BadRequestException, Delete, Param } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHideProperty, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { DoctorGuard } from "../../auth/guards/doctor.guard";
import { UserGuard } from "../../auth/guards/user.guard";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
@ApiTags('CLOUDINARY')
@Controller()
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly amqpConnection: AmqpConnection,
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

        const data = await this.cloudinaryService.uploadImage(file, 'avatar', '/healthline/doctors/' + req.user.id)

        return data
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
        await this.cloudinaryService.slashFolder(public_id)

        const data = await this.cloudinaryService.uploadImage(file, public_id, '/healthline/users/' + req.user.id + '/avatars')

        return data
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
        @Body('medicalId') medicalId: string,
        @Req() req
    ): Promise<any> {

        if (!folder)
            folder = 'default'
        else {
            await this.cloudinaryService.slashFolder(folder)
        }

        const data = await this.cloudinaryService.uploadFile(file, '/healthline/users/' + req.user.id + '/records/' + folder)

        const rabbit = await this.amqpConnection.request<any>({
            exchange: 'healthline.upload.folder',
            routingKey: 'upload',
            payload: { data, user: req.user.id, folder: folder, medicalId: medicalId },
            timeout: 10000,
        })

        return rabbit
    }

    // @UseGuards(UserGuard)
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'xóa thư mục và tất cả tài liệu trong medical_record của người dùng' })
    // @Delete('user/record/:folder')
    // async deleteUserFolder(
    //     @Param('folder') folder: string,
    //     @Req() req
    // ) {
    //     // if (!folder)
    //     //     folder = '/default'
    //     // else {
    //     //     await this.cloudinaryService.slashFolder(folder)
    //     //     folder = '/' + folder
    //     // }

    //     // const path = 'healthline/users/' + req.user.id + '/records/' + folder
    //     return await this.cloudinaryService.deleteFolder(folder)
    // }

}