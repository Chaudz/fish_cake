import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipperDto, UpdateShipperDto } from './dto/shipper.dto';

@Injectable()
export class ShippersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shipper.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const shipper = await this.prisma.shipper.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { customer: true },
        },
      },
    });
    if (!shipper) throw new NotFoundException('Không tìm thấy shipper');
    return shipper;
  }

  async create(dto: CreateShipperDto) {
    return this.prisma.shipper.create({ data: dto });
  }

  async update(id: string, dto: UpdateShipperDto) {
    await this.findOne(id);
    return this.prisma.shipper.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.shipper.delete({ where: { id } });
  }

  async getCodOrders(reconciled?: boolean) {
    return this.prisma.order.findMany({
      where: {
        codAmount: { gt: 0 },
        ...(reconciled !== undefined ? { codReconciled: reconciled } : {}),
      },
      include: { customer: true, shipper: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
