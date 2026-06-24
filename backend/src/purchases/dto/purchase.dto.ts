import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductType } from '@prisma/client';

export class CreatePurchaseDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdatePurchaseDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
