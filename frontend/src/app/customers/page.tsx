"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Customer, CUSTOMER_TYPE_LABELS } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    type: "RETAIL" as "RETAIL" | "WHOLESALE",
    defaultRawPrice: 220000,
    defaultCookedPrice: 250000,
    note: "",
  });

  const load = () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    api<Customer[]>(`/customers${q}`).then(setCustomers);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      type: "RETAIL",
      defaultRawPrice: 220000,
      defaultCookedPrice: 250000,
      note: "",
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await api(`/customers/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await api("/customers", { method: "POST", body: JSON.stringify(form) });
    }
    resetForm();
    load();
  };

  const handleEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      phone: c.phone,
      address: c.address || "",
      type: c.type,
      defaultRawPrice: Number(c.defaultRawPrice),
      defaultCookedPrice: Number(c.defaultCookedPrice),
      note: c.note || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa khách hàng này?")) return;
    try {
      await api(`/customers/${id}`, { method: "DELETE" });
      toast.success("Đã xóa khách hàng");
      load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể xóa khách hàng",
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Khách hàng"
          description="Quản lý danh sách khách hàng"
          action={
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4" /> Thêm khách
            </Button>
          }
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Tìm theo tên hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Button variant="outline" onClick={load} className="w-full sm:w-auto">
            <Search className="h-4 w-4" /> Tìm kiếm
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editing ? "Sửa khách hàng" : "Thêm khách hàng"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label>Họ tên</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loại khách</Label>
                  <Select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "RETAIL" | "WHOLESALE",
                      })
                    }
                  >
                    <option value="RETAIL">Lẻ</option>
                    <option value="WHOLESALE">Sỉ</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Giá chả sống mặc định</Label>
                  <Input
                    type="number"
                    value={form.defaultRawPrice}
                    onChange={(e) =>
                      setForm({ ...form, defaultRawPrice: +e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá chả chín mặc định</Label>
                  <Input
                    type="number"
                    value={form.defaultCookedPrice}
                    onChange={(e) =>
                      setForm({ ...form, defaultCookedPrice: +e.target.value })
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
                <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
                  <Button type="submit" className="w-full sm:w-auto">
                    Lưu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetForm}
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
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-sm text-gray-600">
                      <th className="p-4">Họ tên</th>
                      <th className="p-4">SĐT</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Giá sống</th>
                      <th className="p-4">Giá chín</th>
                      <th className="p-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4">{c.phone}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              c.type === "WHOLESALE" ? "default" : "secondary"
                            }
                          >
                            {CUSTOMER_TYPE_LABELS[c.type]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {formatCurrency(Number(c.defaultRawPrice))}
                        </td>
                        <td className="p-4">
                          {formatCurrency(Number(c.defaultCookedPrice))}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(c)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
              mobile={customers.map((c) => (
                <MobileCard key={c.id}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    <Badge
                      variant={c.type === "WHOLESALE" ? "default" : "secondary"}
                    >
                      {CUSTOMER_TYPE_LABELS[c.type]}
                    </Badge>
                  </div>
                  <MobileCardRow
                    label="Giá sống"
                    value={formatCurrency(Number(c.defaultRawPrice))}
                  />
                  <MobileCardRow
                    label="Giá chín"
                    value={formatCurrency(Number(c.defaultCookedPrice))}
                  />
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(c)}
                    >
                      <Pencil className="h-4 w-4" /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" /> Xóa
                    </Button>
                  </div>
                </MobileCard>
              ))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
