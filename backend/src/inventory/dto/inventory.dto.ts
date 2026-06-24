import { IsEnum, IsNumber, Min } from 'class-validator';
import { ProductType } from '@prisma/client';

export class UpdateInventorySettingDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  @Min(0)
  lowStockThreshold: number;

  @IsNumber()
  @Min(0)
  defaultCostPrice: number;
}
