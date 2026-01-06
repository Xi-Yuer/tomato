import { IsString, IsOptional, Length, IsInt } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  moduleId?: number;
}
