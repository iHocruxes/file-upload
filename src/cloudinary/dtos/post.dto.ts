import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PostDto {
    @IsString()
    @ApiProperty({ example: 'ID' })
    id: string

    @IsString()
    @ApiProperty({ example: 'mô tả bài đăng' })
    description: string

    userId: string

    photo: string[]
}