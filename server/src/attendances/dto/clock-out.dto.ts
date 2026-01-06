import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

// 下班打卡DTO
export class ClockOutDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  latitude: number; // 纬度

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  longitude: number; // 经度
}
