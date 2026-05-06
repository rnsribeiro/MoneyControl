export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getMonthLabel(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - offset);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  }).format(date);
}

export function getMonthKey(dateInput: string | Date) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getRecentMonthKeys(count: number) {
  const months: string[] = [];
  const now = new Date();

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push(getMonthKey(date));
  }

  return months;
}

export function formatMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  }).format(date);
}
