"use client";

import { useEffect, useState } from "react";
import { api, downloadPdf } from "@/lib/api";
import {
  Order,
  Customer,
  Shipper,
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SOURCE_LABELS,
} from "@/lib/types";
import {
  OrderStatusSelect,
  ORDER_STATUSES,
  ORDER_STATUS_COLORS,
} from "@/components/orders/order-status-select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import {
  MobileCard,
  MobileCardRow,
  ResponsiveData,
} from "@/components/ui/responsive-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

import { Plus, FileDown } from "lucide-react";
import { toast } from "sonner";

const PAYMENT_STATUS_VARIANT: Record<
  PaymentStatus,
  "success" | "warning" | "default"
> = {
  PAID: "success",
  DEBT: "warning",
  PARTIAL: "default",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    source: "FACEBOOK" as string,
    shipperId: "",
    shippingFee: 30000,
    paymentStatus: "DEBT" as string,
    paidAmount: 0,
    codAmount: 0,
    note: "",
    items: [
      {
        productType: "RAW" as "RAW" | "COOKED",
        quantity: 1,
        unitPrice: 220000,
      },
    ],
  });

  const load = () => {
    const q = statusFilter ? `?status=${statusFilter}` : "";
    api<Order[]>(`/orders${q}`).then(setOrders);
  };
  useEffect(() => {
    load();
    api<Customer[]>("/customers").then(setCustomers);
    api<Shipper[]>("/shippers").then(setShippers);
  }, [statusFilter]);

  const onCustomerChange = (customerId: string) => {
    const c = customers.find((x) => x.id === customerId);
    setForm({
      ...form,
      customerId,
      items: form.items.map((item) => ({
        ...item,
        unitPrice:
          item.productType === "RAW"
            ? Number(c?.defaultRawPrice ?? 220000)
            : Number(c?.defaultCookedPrice ?? 250000),
      })),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        shipperId: form.shipperId || undefined,
      }),
    });
    setShowForm(false);
    load();
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success(`Đã chuyển sang: ${ORDER_STATUS_LABELS[status]}`);
      load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái",
      );
    }
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal + form.shippingFee;

  const emptyMessage = statusFilter
    ? `Không có đơn hàng trạng thái "${ORDER_STATUS_LABELS[statusFilter as OrderStatus]}"`
    : "Chưa có đơn hàng nào";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Đơn hàng"
          description="Quản lý đơn hàng bán chả cá"
          action={
            <Button
              className="w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" /> Tạo đơn
            </Button>
          }
        />

        <div className="space-y-3">
          <Label className="text-sm text-gray-600">Lọc trạng thái</Label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                !statusFilter
                  ? "border-gray-800 bg-gray-800 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              Tất cả
            </button>
            {ORDER_STATUSES.map((s) => {
              const colors = ORDER_STATUS_COLORS[s];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? cn(colors.chip, "ring-2 ring-offset-1")
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
                  {ORDER_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tạo đơn hàng mới</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Khách hàng</Label>
                    <Select
                      value={form.customerId}
                      onChange={(e) => onCustomerChange(e.target.value)}
                      required
                    >
                      <option value="">Chọn khách hàng</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - {c.phone}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nguồn khách</Label>
                    <Select
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                    >
                      {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shipper</Label>
                    <Select
                      value={form.shipperId}
                      onChange={(e) =>
                        setForm({ ...form, shipperId: e.target.value })
                      }
                    >
                      <option value="">Không chọn</option>
                      {shippers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Thanh toán</Label>
                    <Select
                      value={form.paymentStatus}
                      onChange={(e) =>
                        setForm({ ...form, paymentStatus: e.target.value })
                      }
                    >
                      {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phí ship</Label>
                    <Input
                      type="number"
                      value={form.shippingFee}
                      onChange={(e) =>
                        setForm({ ...form, shippingFee: +e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiền thu hộ (COD)</Label>
                    <Input
                      type="number"
                      value={form.codAmount}
                      onChange={(e) =>
                        setForm({ ...form, codAmount: +e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="mb-3 font-medium">Sản phẩm</p>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="mb-3 grid gap-3 md:grid-cols-3">
                      <Select
                        value={item.productType}
                        onChange={(e) => {
                          const newItems = [...form.items];
                          newItems[idx].productType = e.target.value as
                            | "RAW"
                            | "COOKED";
                          setForm({ ...form, items: newItems });
                        }}
                      >
                        <option value="RAW">Chả sống</option>
                        <option value="COOKED">Chả chín</option>
                      </Select>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="SL (kg)"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...form.items];
                          newItems[idx].quantity = +e.target.value;
                          setForm({ ...form, items: newItems });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Đơn giá"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const newItems = [...form.items];
                          newItems[idx].unitPrice = +e.target.value;
                          setForm({ ...form, items: newItems });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        items: [
                          ...form.items,
                          {
                            productType: "RAW",
                            quantity: 1,
                            unitPrice: 220000,
                          },
                        ],
                      })
                    }
                  >
                    + Thêm sản phẩm
                  </Button>
                </div>

                <p className="text-lg font-semibold">
                  Tổng thanh toán: {formatCurrency(total)}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="w-full sm:w-auto">
                    Tạo đơn
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

        <Card>
          <CardContent className="p-0">
            <ResponsiveData
              desktop={
                orders.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-500">
                    {emptyMessage}
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                        <th className="p-4">Mã đơn</th>
                        <th className="p-4">Khách</th>
                        <th className="p-4">Ngày</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4">Nguồn</th>
                        <th className="p-4">Tổng tiền</th>
                        <th className="p-4">Thanh toán</th>
                        <th className="p-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">{o.code}</td>
                          <td className="p-4">{o.customer?.name}</td>
                          <td className="p-4">{formatDate(o.createdAt)}</td>
                          <td className="p-4">
                            <OrderStatusSelect
                              value={o.status}
                              onChange={(status) => updateStatus(o.id, status)}
                            />
                          </td>
                          <td className="p-4">{SOURCE_LABELS[o.source]}</td>
                          <td className="p-4 font-medium">
                            {formatCurrency(Number(o.totalAmount))}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={PAYMENT_STATUS_VARIANT[o.paymentStatus]}
                            >
                              {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                downloadPdf(
                                  `/reports/delivery-note/${o.id}`,
                                  `phieu-${o.code}.pdf`,
                                )
                              }
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )
              }
              mobile={
                orders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
                    {emptyMessage}
                  </div>
                ) : (
                  orders.map((o) => (
                <MobileCard key={o.id}>
                  <div className="mb-2">
                    <p className="font-mono text-sm font-semibold">{o.code}</p>
                    <p className="text-sm text-gray-600">{o.customer?.name}</p>
                  </div>
                  <div className="mb-3 space-y-2">
                    <Label className="text-xs text-gray-500">Trạng thái</Label>
                    <OrderStatusSelect
                      value={o.status}
                      onChange={(status) => updateStatus(o.id, status)}
                      className="w-full"
                    />
                  </div>
                  <MobileCardRow label="Ngày" value={formatDate(o.createdAt)} />
                  <MobileCardRow
                    label="Nguồn"
                    value={SOURCE_LABELS[o.source]}
                  />
                  <MobileCardRow
                    label="Tổng tiền"
                    value={formatCurrency(Number(o.totalAmount))}
                  />
                  <MobileCardRow
                    label="Thanh toán"
                    value={
                      <Badge variant={PAYMENT_STATUS_VARIANT[o.paymentStatus]}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                      </Badge>
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() =>
                      downloadPdf(
                        `/reports/delivery-note/${o.id}`,
                        `phieu-${o.code}.pdf`,
                      )
                    }
                  >
                    <FileDown className="h-4 w-4" /> In phiếu giao
                  </Button>
                </MobileCard>
                  ))
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
