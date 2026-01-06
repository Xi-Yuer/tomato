import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    CommonModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
