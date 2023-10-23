import { Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service';
import { CloudinaryController } from './controllers/cloudinary.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
    imports: [
        // RabbitMQModule.forRoot(RabbitMQModule, {
        //     exchanges: [
        //         {
        //             name: 'healthline.upload.folder',
        //             type: 'direct'
        //         }
        //     ],
        //     uri: process.env.RABBITMQ_URL,
        //     connectionInitOptions: { wait: true, reject: true, timeout: 2000 },
        // }),
        ClientsModule.register([
            {
                name: 'MATH_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL],
                    queue: 'cats_queue',
                    queueOptions: {
                        durable: false,
                    },
                }
            }
        ])
    ],
    controllers: [CloudinaryController],
    providers: [CloudinaryService]
})
export class NestCloudinaryModule { }
