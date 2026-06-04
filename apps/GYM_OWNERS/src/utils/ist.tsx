
/** Returns the current time as a Date object normalized to IST (UTC+5:30) */
export function getNowIST(): Date {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + istOffset);
}

/** Returns a Date shifted to IST for comparison/display purposes */
export function toIST(date: Date): Date {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + istOffset);
}