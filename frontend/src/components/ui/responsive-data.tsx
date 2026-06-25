import { cn } from "@/lib/utils";

export function MobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MobileCardRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-0",
        className,
      )}
    >
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

export function ResponsiveData({
  desktop,
  mobile,
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="space-y-3 md:hidden">{mobile}</div>
    </>
  );
}

export function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}
