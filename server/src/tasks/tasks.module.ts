import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { TaskModule as TaskModuleEntity } from '../entities/task-module.entity';
import { TaskModulesModule } from '../task-modules/task-modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskModuleEntity]),
    TaskModulesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
