import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CustomerType } from '@prisma/client';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRawPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultCookedPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRawPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultCookedPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
