import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateTaskModuleDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: '开始时间格式必须为 HH:mm:ss',
  })
  startTime?: string; // 时间段开始时间，格式：HH:mm:ss

  @IsString()
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: '结束时间格式必须为 HH:mm:ss',
  })
  endTime?: string; // 时间段结束时间，格式：HH:mm:ss

  @IsOptional()
  isActive?: boolean;
}
