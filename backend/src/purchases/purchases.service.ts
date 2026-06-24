import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dto/purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.purchase.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });
    if (!purchase) throw new NotFoundException('Không tìm thấy phiếu nhập');
    return purchase;
  }

  async create(dto: CreatePurchaseDto) {
    const totalAmount = dto.quantity * dto.costPrice;
    return this.prisma.purchase.create({
      data: {
        date: dto.date ? new Date(dto.date) : new Date(),
        productType: dto.productType,
        quantity: dto.quantity,
        costPrice: dto.costPrice,
        totalAmount,
        note: dto.note,
      },
    });
  }

  async update(id: string, dto: UpdatePurchaseDto) {
    const existing = await this.findOne(id);
    const quantity = dto.quantity ?? Number(existing.quantity);
    const costPrice = dto.costPrice ?? Number(existing.costPrice);
    const totalAmount = quantity * costPrice;
    return this.prisma.purchase.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        totalAmount,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.purchase.delete({ where: { id } });
  }
}
