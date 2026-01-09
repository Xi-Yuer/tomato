import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateProcurementDto {
  @IsInt()
  @IsNotEmpty()
  categoryId: number; // 采购分类ID

  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  itemName: string; // 物品名称

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  quantity: number; // 采购数量

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unitPrice: number; // 单价

  @IsDateString()
  @IsNotEmpty()
  procurementDate: string; // 采购时间（格式：YYYY-MM-DD）

  @IsString()
  @IsOptional()
  paymentScreenshot?: string; // 付款截图URL
}
