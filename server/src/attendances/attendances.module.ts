import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';
import { Attendance } from '../entities/attendance.entity';
import { WorkSession } from '../entities/work-session.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, WorkSession]),
    AuthModule, // 用于AdminGuard
    UsersModule, // 用于AdminGuard中的UsersService
  ],
  controllers: [AttendancesController],
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
