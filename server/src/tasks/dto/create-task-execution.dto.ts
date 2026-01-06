import { IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateTaskExecutionDto {
  @IsInt()
  @IsNotEmpty()
  taskId: number; // 任务模板ID

  @IsDateString()
  @IsNotEmpty()
  executionDate: string; // 执行日期，格式：YYYY-MM-DD

  @IsInt()
  @IsOptional()
  userId?: number; // 执行人ID，可选，从token获取
}
