import { Controller, Inject, UseInterceptors, UploadedFile, Body, Put, UseGuards, Req, BadRequestException, Delete, Param, Post, Patch, UploadedFiles } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiHideProperty, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../services/cloudinary.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { DoctorGuard } from "../../auth/guards/doctor.guard";
import { UserGuard } from "../../auth/guards/user.guard";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { FolderDto } from "../dtos/folder.dto";
import { BlogDto } from "../dtos/blog.dto";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { PostDto } from "../dtos/post.dto";
import { UserDoctorGuard } from "../../auth/guards/user_doctor.guard";
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

        const data = await this.cloudinaryService.uploadFile(file, '/healthline/users/' + req.user.id + '/records/' + medicalId + '/' + folder)

        const rabbit = await this.amqpConnection.request<any>({
            exchange: 'healthline.upload.folder',
            routingKey: 'upload',
            payload: { data, user: req.user.id, folder: folder, medicalId: medicalId },
            timeout: 10000,
        })

        return rabbit
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put('blog')
    @UseInterceptors(FileInterceptor('file'))
    async addNewBlog(
        @UploadedFile() file: Express.Multer.File,
        @Body('dto') dto: any,
    ): Promise<any> {
        const blog: BlogDto = JSON.parse(dto)
        if(blog.title == "" || blog.content == "" || !blog.title || !blog.content)
            throw new BadRequestException("title_or_content_not_null")

        if((blog.id === "" || !blog.id) && !file) {
            throw new BadRequestException("image_not_null")
        } else if(blog.id !== "" && !file) {
            blog.photo = ""
        } else {
            const data = await this.cloudinaryService.uploadImage(file, file.originalname, '/healthline/blog')
            blog.photo = (data as any).public_id || ""
        }

        if(!blog.tag)
            blog.tag = []

        const rabbit = await this.amqpConnection.request<any>({
            exchange: 'healthline.upload.folder',
            routingKey: 'upload_blog',
            payload: blog,
            timeout: 10000,
        })

        return rabbit
    }

    @UseGuards(UserDoctorGuard)
    @ApiBearerAuth()
    @Put('post')
    @UseInterceptors(FilesInterceptor('files'))
    async addNewPost(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body('dto') dto: any,
        @Req() req
    ): Promise<any> {
        const post: PostDto = JSON.parse(dto)
        if(post.description == "" || !post.description)
            throw new BadRequestException("description_not_null")

        if(files.length === 0) {
            post.photo = []
        } else {
            if(files.length > 5) {
                throw new BadRequestException("images_out_of_permission")
            } else {
                const photos = []
                for(var file of files) {
                    const data = await this.cloudinaryService.uploadImage(file, file.originalname, '/healthline/post/' + req.user.id)
                    photos.push((data as any).public_id || "")
                }
                post.photo = photos
            }
        }

        post.userId = req.user.id

        const rabbit = await this.amqpConnection.request<any>({
            exchange: 'healthline.upload.folder',
            routingKey: 'upload_post',
            payload: post,
            timeout: 10000,
        })

        return rabbit
    }

    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'xóa thư mục và tất cả tài liệu trong medical_record của người dùng' })
    @Delete('/user/record')
    async deleteUserFolder(
        @Body() dto: FolderDto,
        @Req() req
    ) {
        await this.cloudinaryService.slashFolder(dto.folder)

        const path = 'healthline/users/' + req.user.id + '/records/' + dto.medicalId + '/' + dto.folder
        return await this.cloudinaryService.deleteFolder(path)
    }

}