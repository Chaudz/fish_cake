# Hệ thống Quản lý Bán Chả Cá Lý Sơn

Hệ thống quản lý bán hàng cho mô hình kinh doanh chả cá Lý Sơn: nhập hàng từ nhà cung cấp, bán lại cho khách với giá khác nhau, theo dõi tồn kho, công nợ, ship và thống kê.

## Công nghệ

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15+, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | NestJS, Prisma ORM, JWT |
| Database | PostgreSQL |
| Deploy | Docker Compose |

## Cấu trúc dự án

```
ban_cha_ca/
├── backend/          # NestJS API
├── frontend/         # Next.js Dashboard
├── docs/             # Tài liệu thiết kế
├── docker-compose.yml
└── README.md
```

## Chạy nhanh với Docker

```bash
# Clone và vào thư mục dự án
cd ban_cha_ca

# Khởi động toàn bộ hệ thống
docker compose up --build

# Truy cập:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001/api
# - Swagger: http://localhost:3001/api/docs
```

**Tài khoản mặc định:** `admin@banchaca.vn` / `admin123`

## Chạy development (không Docker)

### 1. Database

```bash
docker compose up postgres -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Truy cập http://localhost:3000

## Chức năng chính

- **Khách hàng**: CRUD, tìm kiếm, giá mặc định theo loại (Lẻ/Sỉ)
- **Nhập hàng**: Chả sống/chín, tự tính tổng tiền, cộng tồn kho
- **Tồn kho**: Tự động = Nhập - Bán, cảnh báo tồn thấp
- **Đơn hàng**: Trạng thái, nguồn khách, ship, COD
- **Công nợ**: Thanh toán ngay/sau, ghi nhận thu nợ
- **Ship**: Quản lý shipper, đối soát COD
- **Thống kê**: Doanh thu, lợi nhuận, biểu đồ, top KH
- **In phiếu giao hàng**: Xuất PDF

## Tài liệu chi tiết

- [Phân tích nghiệp vụ & ERD](docs/BUSINESS.md)
- [REST API](docs/API.md)

## Biến môi trường

### Backend (.env)

| Biến | Mô tả |
|------|-------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key cho JWT |
| JWT_EXPIRES_IN | Thời hạn token (mặc định 7d) |
| PORT | Port backend (3001) |
| FRONTEND_URL | URL frontend cho CORS |
| BANK_QR_CONTENT | Nội dung QR thanh toán trên phiếu giao |

### Frontend (.env.local)

| Biến | Mô tả |
|------|-------|
| NEXT_PUBLIC_API_URL | URL API backend |

## License

Private - Chả Cá Lý Sơn
# fish_cake
