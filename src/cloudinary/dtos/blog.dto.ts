import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BlogDto {
    @IsString()
    @ApiProperty({ example: 'ID' })
    id: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Tiêu đề blog' })
    title: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Nội dung blog' })
    content: string

    photo: string
}