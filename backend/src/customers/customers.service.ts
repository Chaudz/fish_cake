import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
        debts: {
          include: { payments: { orderBy: { paymentDate: 'desc' } } },
        },
      },
    });
    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [orderCount, debtCount] = await Promise.all([
      this.prisma.order.count({ where: { customerId: id } }),
      this.prisma.debt.count({ where: { customerId: id } }),
    ]);

    if (orderCount > 0 || debtCount > 0) {
      throw new BadRequestException(
        `Không thể xóa khách hàng đã có ${orderCount} đơn hàng và ${debtCount} khoản công nợ. Vui lòng giữ lại hồ sơ khách.`,
      );
    }

    return this.prisma.customer.delete({ where: { id } });
  }

  async getOrderHistory(id: string) {
    return this.prisma.order.findMany({
      where: { customerId: id },
      include: { items: true, shipper: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
