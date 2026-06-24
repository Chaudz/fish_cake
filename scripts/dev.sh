#!/bin/bash
set -e

echo "=== Chả Cá Lý Sơn - Khởi động hệ thống ==="

# Start PostgreSQL
echo "[1/4] Khởi động PostgreSQL..."
docker compose up postgres -d

echo "[2/4] Chờ PostgreSQL sẵn sàng..."
sleep 5

# Backend setup
echo "[3/4] Setup backend..."
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev &
BACKEND_PID=$!
cd ..

# Frontend setup
echo "[4/4] Khởi động frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== Hệ thống đã sẵn sàng ==="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:3001/api"
echo "Swagger:   http://localhost:3001/api/docs"
echo "Login:     admin@banchaca.vn / admin123"
echo ""
echo "Nhấn Ctrl+C để dừng"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
