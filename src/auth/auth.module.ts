import { Module } from '@nestjs/common';
import { DoctorStrategy } from './strategies/doctor.strategy';
import { UserStrategy } from './strategies/user.strategy';
import { AdminGuard } from './guards/admin.guard';

@Module({
    providers: [
        DoctorStrategy,
        UserStrategy,
        AdminGuard
    ],
})
export class AuthModule { }



