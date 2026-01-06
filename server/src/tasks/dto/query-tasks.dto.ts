import { IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../../entities/task-status.enum';

export class QueryTasksDto {
  @IsDateString()
  @IsOptional()
  startDate?: string; // 开始日期

  @IsDateString()
  @IsOptional()
  endDate?: string; // 结束日期

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  moduleId?: number; // 模块ID

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus; // 任务状态

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1; // 页码

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10; // 每页数量
}
