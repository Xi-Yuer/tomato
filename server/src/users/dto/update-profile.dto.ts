import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateProfileDto {
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

  @IsString()
  @IsOptional()
  avatar?: string; // 用户头像URL
}
