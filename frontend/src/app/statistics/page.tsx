'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/ui/page-header';
import { MobileCard, MobileCardRow, ResponsiveData } from '@/components/ui/responsive-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#6b7280'];

export default function StatisticsPage() {
  const [byDay, setByDay] = useState<{ date: string; revenue: number }[]>([]);
  const [byMonth, setByMonth] = useState<{ month: string; revenue: number }[]>([]);
  const [topCustomers, setTopCustomers] = useState<
    { name: string; revenue: number; orderCount: number; totalKg: number }[]
  >([]);
  const [bySource, setBySource] = useState<
    { label: string; revenue: number; orderCount: number }[]
  >([]);

  useEffect(() => {
    api<{ date: string; revenue: number }[]>('/statistics/revenue-by-day?days=30').then(setByDay);
    api<{ month: string; revenue: number }[]>('/statistics/revenue-by-month?months=12').then(setByMonth);
    api<{ name: string; revenue: number; orderCount: number; totalKg: number }[]>('/statistics/top-customers?limit=10').then(setTopCustomers);
    api<{ label: string; revenue: number; orderCount: number }[]>('/statistics/revenue-by-source').then(setBySource);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8">
        <PageHeader title="Thống kê" description="Báo cáo doanh thu và khách hàng" />

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Doanh thu theo ngày (30 ngày)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byDay} margin={{ left: -16, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Doanh thu theo tháng</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byMonth} margin={{ left: -16, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 9 }} width={40} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Doanh thu theo nguồn khách</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={bySource}
                    dataKey="revenue"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={false}
                  >
                    {bySource.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2 md:hidden">
                {bySource.map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {s.label}
                    </span>
                    <span className="font-medium">{formatCurrency(s.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Top khách hàng</CardTitle></CardHeader>
            <CardContent className="p-0 md:p-0">
              <ResponsiveData
                desktop={
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                        <th className="p-4">#</th>
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Đơn</th>
                        <th className="p-4">Kg</th>
                        <th className="p-4">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map((c, i) => (
                        <tr key={c.name} className="border-b">
                          <td className="p-4">{i + 1}</td>
                          <td className="p-4 font-medium">{c.name}</td>
                          <td className="p-4">{c.orderCount}</td>
                          <td className="p-4">{c.totalKg} kg</td>
                          <td className="p-4 font-medium">{formatCurrency(c.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
                mobile={topCustomers.map((c, i) => (
                  <MobileCard key={c.name}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {i + 1}
                      </span>
                      <p className="font-semibold">{c.name}</p>
                    </div>
                    <MobileCardRow label="Số đơn" value={c.orderCount} />
                    <MobileCardRow label="Tổng kg" value={`${c.totalKg} kg`} />
                    <MobileCardRow label="Doanh thu" value={formatCurrency(c.revenue)} />
                  </MobileCard>
                ))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
