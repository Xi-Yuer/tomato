import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryDailyModulesDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '日期格式不正确，应为 YYYY-MM-DD',
  })
  date?: string; // 查询日期，格式：YYYY-MM-DD，不传则默认为今天。返回该日期所有需要完成的任务模块
}
