"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shipper, Order } from "@/lib/types";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  MobileCard,
  MobileCardRow,
  ResponsiveData,
} from "@/components/ui/responsive-data";
import { formatCurrency } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function ShippersPage() {
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [codOrders, setCodOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const load = () => {
    api<Shipper[]>("/shippers").then(setShippers);
    api<Order[]>("/shippers/cod-orders").then(setCodOrders);
  };
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/shippers", { method: "POST", body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: "", phone: "" });
    load();
  };

  const reconcile = async (orderId: string) => {
    await api(`/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ codReconciled: true }),
    });
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Quản lý Ship"
          description="Shipper và đối soát COD"
          action={
            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" /> Thêm shipper
            </Button>
          }
        />

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thêm shipper</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>SĐT</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
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
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {shippers.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 md:p-6">
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đơn COD - Đối soát</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveData
              desktop={
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                        <th className="p-4">Mã đơn</th>
                        <th className="p-4">Khách</th>
                        <th className="p-4">Shipper</th>
                        <th className="p-4">COD</th>
                        <th className="p-4">Đối soát</th>
                        <th className="p-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codOrders.map((o) => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">{o.code}</td>
                          <td className="p-4">{o.customer?.name}</td>
                          <td className="p-4">{o.shipper?.name || "-"}</td>
                          <td className="p-4">
                            {formatCurrency(Number(o.codAmount))}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={o.codReconciled ? "success" : "warning"}
                            >
                              {o.codReconciled
                                ? "Đã đối soát"
                                : "Chưa đối soát"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {!o.codReconciled && (
                              <Button size="sm" onClick={() => reconcile(o.id)}>
                                Đối soát
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
              mobile={codOrders.map((o) => (
                <MobileCard key={o.id}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold">
                        {o.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        {o.customer?.name}
                      </p>
                    </div>
                    <Badge variant={o.codReconciled ? "success" : "warning"}>
                      {o.codReconciled ? "Đã ĐS" : "Chưa ĐS"}
                    </Badge>
                  </div>
                  <MobileCardRow
                    label="Shipper"
                    value={o.shipper?.name || "-"}
                  />
                  <MobileCardRow
                    label="COD"
                    value={formatCurrency(Number(o.codAmount))}
                  />
                  {!o.codReconciled && (
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => reconcile(o.id)}
                    >
                      Đối soát
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
