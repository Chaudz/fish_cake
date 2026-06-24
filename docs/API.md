# REST API Documentation

Base URL: `http://localhost:3001/api`

Authentication: Bearer JWT token (trừ `/auth/login`, `/auth/register`)

## Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| GET | `/auth/profile` | Thông tin user |

### POST /auth/login
```json
{ "email": "admin@banchaca.vn", "password": "admin123" }
```

## Customers

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/customers?search=` | Danh sách / tìm kiếm |
| GET | `/customers/:id` | Chi tiết + lịch sử |
| GET | `/customers/:id/orders` | Lịch sử mua hàng |
| POST | `/customers` | Tạo mới |
| PUT | `/customers/:id` | Cập nhật |
| DELETE | `/customers/:id` | Xóa |

## Purchases (Nhập hàng)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/purchases` | Danh sách phiếu nhập |
| GET | `/purchases/:id` | Chi tiết |
| POST | `/purchases` | Tạo phiếu nhập |
| PUT | `/purchases/:id` | Cập nhật |
| DELETE | `/purchases/:id` | Xóa |

## Inventory (Tồn kho)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/inventory` | Tồn kho hiện tại |
| GET | `/inventory/settings` | Cấu hình cảnh báo |
| PUT | `/inventory/settings` | Cập nhật ngưỡng |

## Orders

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/orders?status=&search=` | Danh sách đơn |
| GET | `/orders/:id` | Chi tiết đơn |
| POST | `/orders` | Tạo đơn |
| PUT | `/orders/:id` | Cập nhật đơn |
| DELETE | `/orders/:id` | Xóa đơn |

## Debts (Công nợ)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/debts` | Danh sách nợ |
| GET | `/debts/summary` | Tổng công nợ |
| GET | `/debts/:id` | Chi tiết |
| GET | `/debts/:id/payments` | Lịch sử thanh toán |
| POST | `/debts/:id/payments` | Ghi nhận thu nợ |

## Shippers

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/shippers` | Danh sách shipper |
| GET | `/shippers/cod-orders` | Đơn COD |
| GET | `/shippers/:id` | Chi tiết |
| POST | `/shippers` | Tạo shipper |
| PUT | `/shippers/:id` | Cập nhật |
| DELETE | `/shippers/:id` | Xóa |

## Statistics

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/statistics/dashboard` | Dashboard tổng quan |
| GET | `/statistics/revenue-by-day?days=30` | Doanh thu theo ngày |
| GET | `/statistics/revenue-by-month?months=12` | Doanh thu theo tháng |
| GET | `/statistics/top-customers?limit=10` | Top khách hàng |
| GET | `/statistics/revenue-by-source` | Doanh thu theo nguồn |

## Reports

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/reports/delivery-note/:orderId` | PDF phiếu giao hàng |

Swagger UI: http://localhost:3001/api/docs
