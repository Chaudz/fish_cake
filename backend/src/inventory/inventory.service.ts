import { Injectable } from '@nestjs/common';
import { ProductType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/decimal.util';
import { UpdateInventorySettingDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory() {
    const [settings, purchases, orderItems] = await Promise.all([
      this.prisma.inventorySetting.findMany(),
      this.prisma.purchase.groupBy({
        by: ['productType'],
        _sum: { quantity: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productType'],
        _sum: { quantity: true },
        where: {
          order: { status: { not: 'CANCELLED' } },
        },
      }),
    ]);

    const types: ProductType[] = ['RAW', 'COOKED'];
    return types.map((type) => {
      const purchased =
        purchases.find((p) => p.productType === type)?._sum.quantity ?? 0;
      const sold =
        orderItems.find((o) => o.productType === type)?._sum.quantity ?? 0;
      const quantity = toNumber(purchased) - toNumber(sold);
      const setting = settings.find((s) => s.productType === type);
      const costPrice = setting ? toNumber(setting.defaultCostPrice) : 0;
      const threshold = setting ? toNumber(setting.lowStockThreshold) : 10;
      const value = quantity * costPrice;

      return {
        productType: type,
        productName: type === 'RAW' ? 'Chả sống' : 'Chả chín',
        quantity,
        costPrice,
        value,
        lowStockThreshold: threshold,
        isLowStock: quantity < threshold,
      };
    });
  }

  async getSettings() {
    return this.prisma.inventorySetting.findMany();
  }

  async updateSetting(dto: UpdateInventorySettingDto) {
    return this.prisma.inventorySetting.upsert({
      where: { productType: dto.productType },
      create: dto,
      update: {
        lowStockThreshold: dto.lowStockThreshold,
        defaultCostPrice: dto.defaultCostPrice,
      },
    });
  }
}
