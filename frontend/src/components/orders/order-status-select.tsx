import { OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
];

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { select: string; dot: string; chip: string }
> = {
  PENDING: {
    select: 'border-amber-300 bg-amber-50 text-amber-900',
    dot: 'bg-amber-500',
    chip: 'border-amber-400 bg-amber-100 text-amber-900 ring-amber-300',
  },
  SHIPPING: {
    select: 'border-blue-300 bg-blue-50 text-blue-900',
    dot: 'bg-blue-500',
    chip: 'border-blue-400 bg-blue-100 text-blue-900 ring-blue-300',
  },
  DELIVERED: {
    select: 'border-green-300 bg-green-50 text-green-900',
    dot: 'bg-green-500',
    chip: 'border-green-400 bg-green-100 text-green-900 ring-green-300',
  },
  CANCELLED: {
    select: 'border-red-300 bg-red-50 text-red-900',
    dot: 'bg-red-500',
    chip: 'border-red-400 bg-red-100 text-red-900 ring-red-300',
  },
};

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  className?: string;
}

export function OrderStatusSelect({
  value,
  onChange,
  className,
}: OrderStatusSelectProps) {
  const colors = ORDER_STATUS_COLORS[value];

  return (
    <div className={cn('relative', className)}>
      <span
        className={cn(
          'pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full',
          colors.dot,
        )}
      />
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className={cn(
          'h-9 w-full min-w-[140px] pl-8 text-sm font-medium',
          colors.select,
        )}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
    </div>
  );
}
