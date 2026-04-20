const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatMonthYear(isoDate: string): string {
  const d = new Date(isoDate);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function groupByMonth<T extends { service_date: string }>(
  items: T[],
): Array<{ monthKey: string; monthLabel: string; items: T[] }> {
  const groups = new Map<string, { monthLabel: string; items: T[] }>();

  for (const item of items) {
    const d = new Date(item.service_date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = formatMonthYear(item.service_date);

    const existing = groups.get(monthKey);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(monthKey, { monthLabel, items: [item] });
    }
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monthKey, value]) => ({ monthKey, ...value }));
}
