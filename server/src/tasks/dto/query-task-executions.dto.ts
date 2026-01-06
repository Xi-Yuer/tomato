import {
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { TaskStatus } from '../../entities/task-status.enum';

export class QueryTaskExecutionsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'executionDate must be in YYYY-MM-DD format',
  })
  executionDate: string; // 执行日期，格式：YYYY-MM-DD

  @IsOptional()
  moduleId?: string; // 模块ID（字符串形式，在服务层转换）

  @IsOptional()
  userId?: string; // 用户ID（字符串形式，在服务层转换）

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus; // 任务状态

  @IsOptional()
  page?: string; // 页码（字符串形式，在服务层转换）

  @IsOptional()
  limit?: string; // 每页数量（字符串形式，在服务层转换）
}
