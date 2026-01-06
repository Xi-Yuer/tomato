import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskExecutionsController } from './task-executions.controller';
import { TaskExecutionsService } from './task-executions.service';
import { TaskExecution } from '../entities/task-execution.entity';
import { TaskStatusLog } from '../entities/task-status-log.entity';
import { Task } from '../entities/task.entity';
import { TaskModule } from '../entities/task-module.entity';
import { User } from '../entities/user.entity';
import { TaskModulesModule } from '../task-modules/task-modules.module';
import { TasksModule } from '../tasks/tasks.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskExecution,
      TaskStatusLog,
      Task,
      TaskModule,
      User,
    ]),
    TaskModulesModule,
    TasksModule,
    CommonModule,
  ],
  controllers: [TaskExecutionsController],
  providers: [TaskExecutionsService],
  exports: [TaskExecutionsService],
})
export class TaskExecutionsModule {}
