import { Body, Controller, Delete, Get, Inject, Injectable, Param, Post, Req, UseGuards } from "@nestjs/common"
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq"
import { CloudinaryService } from "../services/cloudinary.service"

@Injectable()
export class CloudinaryConsumer {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @RabbitRPC({
        exchange: 'healthline.upload.folder',
        routingKey: 'delete_file', 
        queue: 'delete_file',
    })
    async deletePatientRecord(public_ids: string[]): Promise<any> {
        for(let i=0; i<public_ids.length; i++)
            if(await this.cloudinaryService.deleteFile(public_ids[i]) === false)
                return {
                    "code": 400,
                    "message": "delete_file_failed",
                }
        return {
            "code": 200,
            "message": "success"
        }
    }
}