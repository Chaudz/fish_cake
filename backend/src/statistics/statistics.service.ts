import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/decimal.util';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  private async getCostPriceMap() {
    const settings = await this.prisma.inventorySetting.findMany();
    return {
      RAW: toNumber(settings.find((s) => s.productType === 'RAW')?.defaultCostPrice ?? 0),
      COOKED: toNumber(settings.find((s) => s.productType === 'COOKED')?.defaultCostPrice ?? 0),
    };
  }

  private calcOrderCost(
    items: { productType: string; quantity: { toString(): string } | number | string }[],
    costMap: Record<string, number>,
  ) {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.quantity) * (costMap[item.productType] ?? 0),
      0,
    );
  }

  async getDashboard() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, monthOrders, costMap, debtSummary, inventory] =
      await Promise.all([
        this.prisma.order.findMany({
          where: {
            createdAt: { gte: startOfDay },
            status: { not: 'CANCELLED' },
          },
          include: { items: true },
        }),
        this.prisma.order.findMany({
          where: {
            createdAt: { gte: startOfMonth },
            status: { not: 'CANCELLED' },
          },
          include: { items: true },
        }),
        this.getCostPriceMap(),
        this.prisma.debt.aggregate({
          where: { remainingAmount: { gt: 0 } },
          _sum: { remainingAmount: true },
        }),
        this.prisma.purchase.groupBy({
          by: ['productType'],
          _sum: { quantity: true },
        }),
      ]);

    const todayRevenue = todayOrders.reduce(
      (s, o) => s + toNumber(o.totalAmount),
      0,
    );
    const todayCost = todayOrders.reduce(
      (s, o) => s + this.calcOrderCost(o.items, costMap),
      0,
    );

    const monthRevenue = monthOrders.reduce(
      (s, o) => s + toNumber(o.totalAmount),
      0,
    );
    const monthCost = monthOrders.reduce(
      (s, o) => s + this.calcOrderCost(o.items, costMap),
      0,
    );

    return {
      today: {
        orderCount: todayOrders.length,
        revenue: todayRevenue,
        cost: todayCost,
        profit: todayRevenue - todayCost,
      },
      month: {
        revenue: monthRevenue,
        cost: monthCost,
        profit: monthRevenue - monthCost,
      },
      totalDebt: toNumber(debtSummary._sum.remainingAmount ?? 0),
      inventory,
    };
  }

  async getRevenueByDay(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, totalAmount: true },
    });

    const map = new Map<string, number>();
    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];
      map.set(key, (map.get(key) ?? 0) + toNumber(order.totalAmount));
    }

    return Array.from(map.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getRevenueByMonth(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, totalAmount: true },
    });

    const map = new Map<string, number>();
    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + toNumber(order.totalAmount));
    }

    return Array.from(map.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTopCustomers(limit = 10) {
    const customers = await this.prisma.customer.findMany({
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } },
          include: { items: true },
        },
      },
    });

    return customers
      .map((c) => {
        const orderCount = c.orders.length;
        const revenue = c.orders.reduce(
          (s, o) => s + toNumber(o.totalAmount),
          0,
        );
        const totalKg = c.orders.reduce(
          (s, o) =>
            s + o.items.reduce((is, i) => is + toNumber(i.quantity), 0),
          0,
        );
        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          orderCount,
          revenue,
          totalKg,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getRevenueBySource() {
    const orders = await this.prisma.order.groupBy({
      by: ['source'],
      where: { status: { not: 'CANCELLED' } },
      _sum: { totalAmount: true },
      _count: true,
    });

    const sourceLabels: Record<string, string> = {
      FACEBOOK: 'Facebook',
      TIKTOK: 'TikTok',
      ZALO: 'Zalo',
      WEBSITE: 'Website',
      REFERRAL: 'Người quen',
      OTHER: 'Khác',
    };

    return orders.map((o) => ({
      source: o.source,
      label: sourceLabels[o.source] ?? o.source,
      revenue: toNumber(o._sum.totalAmount ?? 0),
      orderCount: o._count,
    }));
  }
}
