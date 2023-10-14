import { Module } from '@nestjs/common';
import { NestCloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    NestCloudinaryModule
  ],
})
export class AppModule { }
