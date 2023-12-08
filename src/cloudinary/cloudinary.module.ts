import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryController } from './controllers/cloudinary.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { CloudinaryConsumer } from './consumers/cloudinary.consumer';

@Module({
    imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
            exchanges: [
                {
                    name: 'healthline.upload.folder',
                    type: 'direct'
                }
            ],
            uri: process.env.RABBITMQ_URL,
            connectionInitOptions: { wait: true, reject: true, timeout: 10000 },
        }),
    ],
    controllers: [CloudinaryController],
    providers: [CloudinaryService, CloudinaryConsumer]
})
export class NestCloudinaryModule { }
