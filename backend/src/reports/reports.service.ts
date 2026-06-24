import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { toNumber } from '../common/utils/decimal.util';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async generateDeliveryNote(orderId: string): Promise<StreamableFile> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, items: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const productLabels: Record<string, string> = {
      RAW: 'Chả sống',
      COOKED: 'Chả chín',
    };

    const paymentLabels: Record<string, string> = {
      PAID: 'Đã thanh toán',
      DEBT: 'Công nợ',
      PARTIAL: 'Thanh toán một phần',
    };

    const doc = new PDFDocument({ margin: 50, size: 'A5' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const bankQr = this.config.get<string>('BANK_QR_CONTENT') || '';

    doc.fontSize(16).text('PHIẾU GIAO HÀNG', { align: 'center' });
    doc.fontSize(10).text('Chả Cá Lý Sơn', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Mã đơn: ${order.code}`);
    doc.text(`Ngày: ${order.createdAt.toLocaleDateString('vi-VN')}`);
    doc.moveDown();

    doc.fontSize(11).text('Thông tin khách hàng', { underline: true });
    doc.fontSize(10);
    doc.text(`Tên: ${order.customer.name}`);
    doc.text(`SĐT: ${order.customer.phone}`);
    doc.text(`Địa chỉ: ${order.customer.address || 'N/A'}`);
    doc.moveDown();

    doc.fontSize(11).text('Sản phẩm', { underline: true });
    doc.fontSize(10);
    for (const item of order.items) {
      doc.text(
        `${productLabels[item.productType]}: ${toNumber(item.quantity)} kg x ${toNumber(item.unitPrice).toLocaleString('vi-VN')}đ = ${toNumber(item.totalPrice).toLocaleString('vi-VN')}đ`,
      );
    }
    doc.moveDown();

    doc.text(`Phí ship: ${toNumber(order.shippingFee).toLocaleString('vi-VN')}đ`);
    doc.fontSize(12).font('Helvetica-Bold').text(
      `Tổng tiền: ${toNumber(order.totalAmount).toLocaleString('vi-VN')}đ`,
    );
    doc.font('Helvetica');
    doc.fontSize(10).text(
      `Thanh toán: ${paymentLabels[order.paymentStatus]} (${toNumber(order.paidAmount).toLocaleString('vi-VN')}đ)`,
    );

    if (order.note) {
      doc.moveDown().text(`Ghi chú: ${order.note}`);
    }

    if (bankQr) {
      doc.moveDown();
      doc.fontSize(9).text('QR Thanh toán ngân hàng:', { underline: true });
      doc.text(bankQr);
    }

    doc.end();

    await new Promise<void>((resolve) => doc.on('end', resolve));
    const buffer = Buffer.concat(chunks);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="phieu-giao-hang-${order.code}.pdf"`,
    });
  }
}
