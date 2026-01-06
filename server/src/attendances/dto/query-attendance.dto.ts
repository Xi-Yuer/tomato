import { IsInt, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAttendanceDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(2000)
  @Max(3000)
  year: number; // 年份

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number; // 月份（1-12）

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  userId?: number; // 用户ID（可选，管理员查询时使用）
}
