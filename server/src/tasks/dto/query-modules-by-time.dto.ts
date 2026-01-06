import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryModulesByTimeDto {
  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: '当前时间格式不正确，应为 HH:mm:ss',
  })
  currentTime?: string; // 当前时间，格式：HH:mm:ss，查询包含该时间点的所有任务模块
}
