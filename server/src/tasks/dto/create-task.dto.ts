import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  moduleId: number; // 所属模块ID
}
