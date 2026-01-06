import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TaskModulesModule } from './task-modules/task-modules.module';
import { TaskExecutionsModule } from './task-executions/task-executions.module';
import { AttendancesModule } from './attendances/attendances.module';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { TaskModule } from './entities/task-module.entity';
import { TaskExecution } from './entities/task-execution.entity';
import { TaskStatusLog } from './entities/task-status-log.entity';
import { Attendance } from './entities/attendance.entity';
import { WorkSession } from './entities/work-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '2214380963Wx!!',
      database: process.env.DB_DATABASE || 'tomato_manager',
      entities: [
        User,
        Task,
        TaskModule,
        TaskExecution,
        TaskStatusLog,
        Attendance,
        WorkSession,
      ],
      synchronize: process.env.NODE_ENV !== 'production', // 生产环境应设为false
      logging: process.env.NODE_ENV === 'development',
      timezone: '+08:00', // 设置数据库连接时区为东八区
      extra: {
        // mysql2 连接池选项
        connectionLimit: 10,
      },
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    TasksModule,
    TaskModulesModule,
    TaskExecutionsModule,
    AttendancesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用日志中间件到所有路由
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
