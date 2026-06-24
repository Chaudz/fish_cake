import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtPaymentDto } from './dto/debt.dto';
import { toNumber } from '../common/utils/decimal.util';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.debt.findMany({
      where: { remainingAmount: { gt: 0 } },
      include: {
        customer: true,
        order: true,
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSummary() {
    const debts = await this.prisma.debt.findMany({
      where: { remainingAmount: { gt: 0 } },
    });
    const totalDebt = debts.reduce(
      (sum, d) => sum + toNumber(d.remainingAmount),
      0,
    );
    return { totalDebt, debtCount: debts.length };
  }

  async findOne(id: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        customer: true,
        order: { include: { items: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });
    if (!debt) throw new NotFoundException('Không tìm thấy công nợ');
    return debt;
  }

  async addPayment(debtId: string, dto: CreateDebtPaymentDto) {
    const debt = await this.findOne(debtId);
    const remaining = toNumber(debt.remainingAmount);

    if (dto.amount > remaining) {
      throw new BadRequestException('Số tiền thanh toán vượt quá nợ còn lại');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.create({
        data: {
          debtId,
          amount: dto.amount,
          note: dto.note,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        },
      });

      const newPaid = toNumber(debt.paidAmount) + dto.amount;
      const newRemaining = toNumber(debt.totalAmount) - newPaid;

      await tx.debt.update({
        where: { id: debtId },
        data: { paidAmount: newPaid, remainingAmount: newRemaining },
      });

      if (debt.orderId) {
        await tx.order.update({
          where: { id: debt.orderId },
          data: {
            paidAmount: newPaid,
            paymentStatus:
              newRemaining <= 0 ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'DEBT',
          },
        });
      }

      return payment;
    });
  }

  async getPaymentHistory(debtId: string) {
    await this.findOne(debtId);
    return this.prisma.debtPayment.findMany({
      where: { debtId },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
