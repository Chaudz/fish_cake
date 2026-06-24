import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CustomerSource,
  OrderStatus,
  PaymentStatus,
  ProductType,
} from '@prisma/client';

export class OrderItemDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(CustomerSource)
  @IsOptional()
  source?: CustomerSource;

  @IsString()
  @IsOptional()
  shipperId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingFee?: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  codAmount?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(CustomerSource)
  @IsOptional()
  source?: CustomerSource;

  @IsString()
  @IsOptional()
  shipperId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingFee?: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  codAmount?: number;

  @IsOptional()
  codReconciled?: boolean;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[];
}
