import { Decimal } from '@prisma/client/runtime/library';

export function toNumber(value: Decimal | number | string): number {
  if (value instanceof Decimal) return value.toNumber();
  return Number(value);
}

export function sumDecimals(
  values: (Decimal | number | string)[],
): number {
  return values.reduce<number>((acc, v) => acc + toNumber(v), 0);
}
