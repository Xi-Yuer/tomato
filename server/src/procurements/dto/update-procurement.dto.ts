import {
  IsString,
  IsOptional,
  Length,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateProcurementDto {
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  @Length(1, 200)
  itemName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsDateString()
  @IsOptional()
  procurementDate?: string;

  @IsString()
  @IsOptional()
  paymentScreenshot?: string;
}
