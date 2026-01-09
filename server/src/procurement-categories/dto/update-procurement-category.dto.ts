import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateProcurementCategoryDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  color?: string;
}
