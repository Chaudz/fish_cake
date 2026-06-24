import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string, search?: string) {
    return this.prisma.order.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(search
          ? {
              OR: [
                { code: { contains: search, mode: 'insensitive' } },
                {
                  customer: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        customer: true,
        items: true,
        shipper: true,
        debt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        shipper: true,
        debt: { include: { payments: true } },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  private async generateOrderCode(): Promise<string> {
    const today = new Date();
    const prefix = `DH${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const count = await this.prisma.order.count({
      where: { code: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  private calcSubtotal(
    items: { quantity: number; unitPrice: number }[],
  ): number {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    const code = await this.generateOrderCode();
    const subtotal = this.calcSubtotal(dto.items);
    const shippingFee = dto.shippingFee ?? 0;
    const totalAmount = subtotal + shippingFee;
    const paymentStatus = dto.paymentStatus ?? PaymentStatus.DEBT;
    const paidAmount =
      paymentStatus === PaymentStatus.PAID
        ? totalAmount
        : (dto.paidAmount ?? 0);

    if (paidAmount > totalAmount) {
      throw new BadRequestException('Số tiền thanh toán vượt quá tổng đơn');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code,
          customerId: dto.customerId,
          source: dto.source,
          shipperId: dto.shipperId,
          shippingFee,
          subtotal,
          totalAmount,
          paymentStatus,
          paidAmount,
          codAmount: dto.codAmount ?? 0,
          note: dto.note,
          items: {
            create: dto.items.map((item) => ({
              productType: item.productType,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          },
        },
        include: { customer: true, items: true, shipper: true },
      });

      const remaining = totalAmount - paidAmount;
      if (remaining > 0) {
        await tx.debt.create({
          data: {
            customerId: dto.customerId,
            orderId: order.id,
            totalAmount,
            paidAmount,
            remainingAmount: remaining,
          },
        });
      }

      return order;
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.findOne(id);

    let subtotal = Number(existing.subtotal);
    let itemsUpdate = undefined;

    if (dto.items) {
      subtotal = this.calcSubtotal(dto.items);
      itemsUpdate = {
        deleteMany: {},
        create: dto.items.map((item) => ({
          productType: item.productType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      };
    }

    const shippingFee = dto.shippingFee ?? Number(existing.shippingFee);
    const totalAmount = subtotal + shippingFee;
    const paymentStatus = dto.paymentStatus ?? existing.paymentStatus;
    const paidAmount =
      dto.paidAmount ??
      (paymentStatus === PaymentStatus.PAID
        ? totalAmount
        : Number(existing.paidAmount));

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          source: dto.source,
          shipperId: dto.shipperId,
          shippingFee,
          subtotal,
          totalAmount,
          paymentStatus,
          paidAmount,
          codAmount: dto.codAmount,
          codReconciled: dto.codReconciled,
          note: dto.note,
          ...(itemsUpdate ? { items: itemsUpdate } : {}),
        },
        include: { customer: true, items: true, shipper: true, debt: true },
      });

      const remaining = totalAmount - paidAmount;
      if (existing.debt) {
        if (remaining <= 0) {
          await tx.debt.delete({ where: { id: existing.debt.id } });
        } else {
          await tx.debt.update({
            where: { id: existing.debt.id },
            data: { totalAmount, paidAmount, remainingAmount: remaining },
          });
        }
      } else if (remaining > 0) {
        await tx.debt.create({
          data: {
            customerId: existing.customerId,
            orderId: id,
            totalAmount,
            paidAmount,
            remainingAmount: remaining,
          },
        });
      }

      return order;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }
}
