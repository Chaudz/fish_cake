'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { InventoryItem } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, Package } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(10);
  const [costPrice, setCostPrice] = useState(0);

  const load = () => api<InventoryItem[]>('/inventory').then(setInventory);
  useEffect(() => { load(); }, []);

  const startEdit = (item: InventoryItem) => {
    setEditing(item.productType);
    setThreshold(item.lowStockThreshold);
    setCostPrice(item.costPrice);
  };

  const saveSetting = async (productType: string) => {
    await api('/inventory/settings', {
      method: 'PUT',
      body: JSON.stringify({ productType, lowStockThreshold: threshold, defaultCostPrice: costPrice }),
    });
    setEditing(null);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Tồn kho"
          description="Tồn kho = Tổng nhập - Tổng bán"
        />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {inventory.map((item) => (
            <Card key={item.productType} className={item.isLowStock ? 'border-yellow-300' : ''}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 rounded-lg bg-blue-100 p-2.5 sm:p-3">
                    <Package className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">{item.productName}</CardTitle>
                </div>
                {item.isLowStock && (
                  <Badge variant="warning">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Tồn thấp
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">Còn lại</p>
                    <p className="text-2xl font-bold">{item.quantity} kg</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">Giá trị tồn</p>
                    <p className="text-2xl font-bold">{formatCurrency(item.value)}</p>
                  </div>
                </div>

                {editing === item.productType ? (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="space-y-2">
                      <Label>Ngưỡng cảnh báo (kg)</Label>
                      <Input type="number" value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Giá vốn mặc định (đ/kg)</Label>
                      <Input type="number" value={costPrice} onChange={(e) => setCostPrice(+e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button size="sm" className="w-full sm:w-auto" onClick={() => saveSetting(item.productType)}>Lưu</Button>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => setEditing(null)}>Hủy</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                    Cấu hình cảnh báo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
