import { IsString, IsOptional, IsArray } from 'class-validator';

export class SubmitTaskDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photoUrls?: string[]; // 照片URL数组

  @IsString()
  @IsOptional()
  notes?: string; // 备注信息
}
