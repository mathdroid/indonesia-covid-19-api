export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
export const getISODate = (date: Date) => date.toISOString().split("T")[0];
