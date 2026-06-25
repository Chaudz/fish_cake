"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  today: {
    orderCount: number;
    revenue: number;
    cost: number;
    profit: number;
  };
  month: {
    revenue: number;
    cost: number;
    profit: number;
  };
  totalDebt: number;
}

interface InventoryItem {
  productName: string;
  quantity: number;
  value: number;
  isLowStock: boolean;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [chartData, setChartData] = useState<
    { date: string; revenue: number }[]
  >([]);

  useEffect(() => {
    api<DashboardData>("/statistics/dashboard").then(setData);
    api<InventoryItem[]>("/inventory").then(setInventory);
    api<{ date: string; revenue: number }[]>(
      "/statistics/revenue-by-day?days=7",
    ).then(setChartData);
  }, []);

  const stats = [
    {
      title: "Đơn hàng hôm nay",
      value: data?.today.orderCount ?? 0,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(data?.today.revenue ?? 0),
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Lợi nhuận hôm nay",
      value: formatCurrency(data?.today.profit ?? 0),
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Tổng công nợ",
      value: formatCurrency(data?.totalDebt ?? 0),
      icon: CreditCard,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="Dashboard"
          description="Tổng quan kinh doanh hôm nay"
        />

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="flex items-center gap-3 p-4 md:gap-4 md:p-6">
                  <div
                    className={`shrink-0 rounded-lg p-2.5 md:p-3 ${stat.color}`}
                  >
                    <Icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-gray-500 md:text-sm">
                      {stat.title}
                    </p>
                    <p className="text-lg font-bold md:text-2xl">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doanh thu 7 ngày qua</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} width={45} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tồn kho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inventory.map((item) => (
                <div
                  key={item.productName}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {item.isLowStock && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} kg · {formatCurrency(item.value)}
                      </p>
                    </div>
                  </div>
                  {item.isLowStock && <Badge variant="warning">Tồn thấp</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(data?.month.revenue ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-600">Giá vốn</p>
                <p className="text-xl font-bold text-gray-700">
                  {formatCurrency(data?.month.cost ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-sm text-gray-600">Lợi nhuận</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(data?.month.profit ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
