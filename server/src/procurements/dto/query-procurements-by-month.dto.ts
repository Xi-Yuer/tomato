import { IsInt, IsNotEmpty, Min, Max, IsOptional } from 'class-validator';

export class QueryProcurementsByMonthDto {
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(3000)
  year: number; // 年份

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number; // 月份

  @IsInt()
  @IsOptional()
  categoryId?: number; // 可选：按分类筛选
}
