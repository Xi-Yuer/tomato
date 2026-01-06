import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  gender?: string;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  address?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean; // 是否是管理员
}
