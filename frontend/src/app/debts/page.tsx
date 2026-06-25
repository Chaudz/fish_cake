"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Debt } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  MobileCard,
  MobileCardRow,
  ResponsiveData,
} from "@/components/ui/responsive-data";
import { formatCurrency } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState({ totalDebt: 0, debtCount: 0 });
  const [paying, setPaying] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  const load = () => {
    api<Debt[]>("/debts").then(setDebts);
    api<{ totalDebt: number; debtCount: number }>("/debts/summary").then(
      setSummary,
    );
  };
  useEffect(() => {
    load();
  }, []);

  const handlePayment = async (debtId: string) => {
    await api(`/debts/${debtId}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
    setPaying(null);
    setAmount(0);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Công nợ" description="Quản lý công nợ khách hàng" />

        <Card>
          <CardContent className="flex items-center gap-4 p-4 md:p-6">
            <div className="shrink-0 rounded-lg bg-orange-100 p-3">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Tổng công nợ hiện tại</p>
              <p className="text-xl font-bold text-orange-600 md:text-2xl">
                {formatCurrency(summary.totalDebt)}
              </p>
              <p className="text-sm text-gray-400">
                {summary.debtCount} khoản nợ
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 md:p-0">
            <ResponsiveData
              desktop={
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                        <th className="p-4">Khách hàng</th>
                        <th className="p-4">Mã đơn</th>
                        <th className="p-4">Tổng nợ</th>
                        <th className="p-4">Đã trả</th>
                        <th className="p-4">Còn nợ</th>
                        <th className="p-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debts.map((d) => (
                        <tr key={d.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">
                            {d.customer?.name}
                          </td>
                          <td className="p-4 font-mono text-sm">
                            {d.order?.code || "-"}
                          </td>
                          <td className="p-4">
                            {formatCurrency(Number(d.totalAmount))}
                          </td>
                          <td className="p-4 text-green-600">
                            {formatCurrency(Number(d.paidAmount))}
                          </td>
                          <td className="p-4 font-bold text-red-600">
                            {formatCurrency(Number(d.remainingAmount))}
                          </td>
                          <td className="p-4">
                            {paying === d.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-32"
                                  value={amount}
                                  onChange={(e) => setAmount(+e.target.value)}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handlePayment(d.id)}
                                >
                                  OK
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPaying(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPaying(d.id);
                                  setAmount(Number(d.remainingAmount));
                                }}
                              >
                                Thu nợ
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
              mobile={debts.map((d) => (
                <MobileCard key={d.id}>
                  <p className="mb-1 font-semibold">{d.customer?.name}</p>
                  <p className="mb-3 font-mono text-xs text-gray-500">
                    {d.order?.code || "-"}
                  </p>
                  <MobileCardRow
                    label="Tổng nợ"
                    value={formatCurrency(Number(d.totalAmount))}
                  />
                  <MobileCardRow
                    label="Đã trả"
                    value={
                      <span className="text-green-600">
                        {formatCurrency(Number(d.paidAmount))}
                      </span>
                    }
                  />
                  <MobileCardRow
                    label="Còn nợ"
                    value={
                      <span className="text-red-600">
                        {formatCurrency(Number(d.remainingAmount))}
                      </span>
                    }
                  />
                  {paying === d.id ? (
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(+e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handlePayment(d.id)}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setPaying(null)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setPaying(d.id);
                        setAmount(Number(d.remainingAmount));
                      }}
                    >
                      Thu nợ
                    </Button>
                  )}
                </MobileCard>
              ))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
