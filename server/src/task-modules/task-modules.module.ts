import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModulesController } from './task-modules.controller';
import { TaskModulesService } from './task-modules.service';
import { TaskModule as TaskModuleEntity } from '../entities/task-module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskModuleEntity])],
  controllers: [TaskModulesController],
  providers: [TaskModulesService],
  exports: [TaskModulesService],
})
export class TaskModulesModule {}
