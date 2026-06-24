import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@banchaca.vn' },
    update: {},
    create: {
      email: 'admin@banchaca.vn',
      password,
      name: 'Quản trị viên',
      role: 'ADMIN',
    },
  });

  await prisma.product.upsert({
    where: { type: 'RAW' },
    update: {},
    create: { name: 'Chả sống', type: 'RAW' },
  });
  await prisma.product.upsert({
    where: { type: 'COOKED' },
    update: {},
    create: { name: 'Chả chín', type: 'COOKED' },
  });

  await prisma.inventorySetting.upsert({
    where: { productType: 'RAW' },
    update: {},
    create: {
      productType: 'RAW',
      lowStockThreshold: 20,
      defaultCostPrice: 180000,
    },
  });
  await prisma.inventorySetting.upsert({
    where: { productType: 'COOKED' },
    update: {},
    create: {
      productType: 'COOKED',
      lowStockThreshold: 15,
      defaultCostPrice: 200000,
    },
  });

  const shipper1 = await prisma.shipper.upsert({
    where: { id: 'seed-shipper-1' },
    update: {},
    create: {
      id: 'seed-shipper-1',
      name: 'Anh Tuấn Ship',
      phone: '0901234567',
    },
  });
  await prisma.shipper.upsert({
    where: { id: 'seed-shipper-2' },
    update: {},
    create: {
      id: 'seed-shipper-2',
      name: 'Chị Lan Giao',
      phone: '0912345678',
    },
  });

  const customer1 = await prisma.customer.upsert({
    where: { id: 'seed-customer-1' },
    update: {},
    create: {
      id: 'seed-customer-1',
      name: 'Nguyễn Văn A',
      phone: '0901111111',
      address: '123 Nguyễn Huệ, Q1, TP.HCM',
      type: 'RETAIL',
      defaultRawPrice: 220000,
      defaultCookedPrice: 250000,
    },
  });
  const customer2 = await prisma.customer.upsert({
    where: { id: 'seed-customer-2' },
    update: {},
    create: {
      id: 'seed-customer-2',
      name: 'Trần Thị B (Sỉ)',
      phone: '0902222222',
      address: '456 Lê Lợi, Q3, TP.HCM',
      type: 'WHOLESALE',
      defaultRawPrice: 200000,
      defaultCookedPrice: 230000,
    },
  });

  const existingPurchase = await prisma.purchase.count();
  if (existingPurchase === 0) {
    await prisma.purchase.createMany({
      data: [
        {
          date: new Date(),
          productType: 'RAW',
          quantity: 100,
          costPrice: 180000,
          totalAmount: 18000000,
          note: 'Nhập từ anh 2',
        },
        {
          date: new Date(),
          productType: 'COOKED',
          quantity: 80,
          costPrice: 200000,
          totalAmount: 16000000,
          note: 'Nhập từ anh 2',
        },
      ],
    });
  }

  const existingOrder = await prisma.order.count();
  if (existingOrder === 0) {
    const order = await prisma.order.create({
      data: {
        code: 'DH202506240001',
        customerId: customer1.id,
        status: 'DELIVERED',
        source: 'FACEBOOK',
        shipperId: shipper1.id,
        shippingFee: 30000,
        subtotal: 440000,
        totalAmount: 470000,
        paymentStatus: 'PAID',
        paidAmount: 470000,
        codAmount: 0,
        items: {
          create: [
            {
              productType: 'RAW',
              quantity: 2,
              unitPrice: 220000,
              totalPrice: 440000,
            },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        code: 'DH202506240002',
        customerId: customer2.id,
        status: 'SHIPPING',
        source: 'ZALO',
        shipperId: shipper1.id,
        shippingFee: 50000,
        subtotal: 1000000,
        totalAmount: 1050000,
        paymentStatus: 'DEBT',
        paidAmount: 0,
        codAmount: 1050000,
        items: {
          create: [
            {
              productType: 'RAW',
              quantity: 5,
              unitPrice: 200000,
              totalPrice: 1000000,
            },
          ],
        },
        debt: {
          create: {
            customerId: customer2.id,
            totalAmount: 1050000,
            paidAmount: 0,
            remainingAmount: 1050000,
          },
        },
      },
    });
  }

  console.log('Seed completed!');
  console.log('Login: admin@banchaca.vn / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
