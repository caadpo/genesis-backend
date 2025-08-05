function parseDateOnly(value: string | Date): Date {
  if (!value) return null;
  const [year, month, day] =
    typeof value === 'string'
      ? value.split('-').map(Number)
      : [value.getFullYear(), value.getMonth() + 1, value.getDate()];
  return new Date(year, month - 1, day); // ⛔️ NÃO usa UTC
}
