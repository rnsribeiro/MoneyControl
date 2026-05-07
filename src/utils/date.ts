export function parseDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(date);
  }

  return new Date(year, month - 1, day);
}

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function compareDateOnly(a: string, b: string) {
  return parseDateOnly(a).getTime() - parseDateOnly(b).getTime();
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parseDateOnly(date));
}

export function getMonthLabel(offset: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - offset);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  }).format(date);
}

export function getMonthKey(dateInput: string | Date) {
  const date =
    typeof dateInput === "string" ? parseDateOnly(dateInput) : dateInput;
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

export function formatMonthKeyLong(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}
