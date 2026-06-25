"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Purchase, PRODUCT_TYPE_LABELS } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  MobileCard,
  MobileCardRow,
  ResponsiveData,
} from "@/components/ui/responsive-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    productType: "RAW" as "RAW" | "COOKED",
    quantity: 10,
    costPrice: 180000,
    note: "",
  });

  const load = () => api<Purchase[]>("/purchases").then(setPurchases);
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/purchases", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Nhập hàng"
          description="Quản lý nhập hàng từ nhà cung cấp"
          action={
            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" /> Nhập hàng
            </Button>
          }
        />

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phiếu nhập hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>Ngày nhập</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loại sản phẩm</Label>
                  <Select
                    value={form.productType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        productType: e.target.value as "RAW" | "COOKED",
                      })
                    }
                  >
                    <option value="RAW">Chả sống</option>
                    <option value="COOKED">Chả chín</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số lượng (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: +e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá vốn / kg</Label>
                  <Input
                    type="number"
                    value={form.costPrice}
                    onChange={(e) =>
                      setForm({ ...form, costPrice: +e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Ghi chú</Label>
                  <Input
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm text-gray-600">
                    Tổng tiền: {formatCurrency(form.quantity * form.costPrice)}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" className="w-full sm:w-auto">
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => setShowForm(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <ResponsiveData
              desktop={
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                        <th className="p-4">Ngày</th>
                        <th className="p-4">Sản phẩm</th>
                        <th className="p-4">SL (kg)</th>
                        <th className="p-4">Giá vốn/kg</th>
                        <th className="p-4">Tổng tiền</th>
                        <th className="p-4">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{formatDate(p.date)}</td>
                          <td className="p-4">
                            {PRODUCT_TYPE_LABELS[p.productType]}
                          </td>
                          <td className="p-4">{Number(p.quantity)}</td>
                          <td className="p-4">
                            {formatCurrency(Number(p.costPrice))}
                          </td>
                          <td className="p-4 font-medium">
                            {formatCurrency(Number(p.totalAmount))}
                          </td>
                          <td className="p-4 text-gray-500">{p.note || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
              mobile={purchases.map((p) => (
                <MobileCard key={p.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">
                      {PRODUCT_TYPE_LABELS[p.productType]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(p.date)}
                    </p>
                  </div>
                  <MobileCardRow
                    label="Số lượng"
                    value={`${Number(p.quantity)} kg`}
                  />
                  <MobileCardRow
                    label="Giá vốn/kg"
                    value={formatCurrency(Number(p.costPrice))}
                  />
                  <MobileCardRow
                    label="Tổng tiền"
                    value={formatCurrency(Number(p.totalAmount))}
                  />
                  {p.note && <MobileCardRow label="Ghi chú" value={p.note} />}
                </MobileCard>
              ))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
