import * as dotenv from 'dotenv'

dotenv.config()

let extraOptions = {}
if (process.env.NODE_ENV !== "development") {
    extraOptions = {
        ssl: {
            rejectUnauthorized: false,
        },
    };
}

export const cloudinaryOption: any = {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true
}