import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength, MaxLength, Matches, IsEmail, IsEnum } from "class-validator";

export class FolderDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'default' })
    folder: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'id' })
    medicalId: string
}