import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class CreateProcurementCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string; // 分类名称

  @IsString()
  @IsOptional()
  @Length(1, 50)
  color?: string; // 分类颜色标签
}
