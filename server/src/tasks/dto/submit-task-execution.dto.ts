import {
  IsEnum,
  IsOptional,
  IsArray,
  IsString,
  IsNotEmpty,
  ArrayMaxSize,
} from 'class-validator';
import { TaskStatus } from '../../entities/task-status.enum';

export class SubmitTaskExecutionDto {
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus; // 任务状态

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(10, { message: '最多只能上传10张照片' })
  @IsString({ each: true, message: '照片URL必须是字符串' })
  photoUrls?: string[]; // 照片URL数组，支持多张照片（最多10张）

  @IsString()
  @IsOptional()
  notes?: string; // 备注信息
}
