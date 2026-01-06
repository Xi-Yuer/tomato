import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

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
  isAdmin?: boolean; // 是否是管理员，默认为 false
}
