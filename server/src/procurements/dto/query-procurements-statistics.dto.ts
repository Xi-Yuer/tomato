import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class QueryProcurementsStatisticsDto {
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
}
