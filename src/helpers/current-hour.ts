import * as dayjs from 'dayjs';

export function getCurrentHour() {
  const currentTime = dayjs();
  const startOfHour = currentTime.startOf('hour').toDate();
  const endOfHour = currentTime.endOf('hour').toDate();

  return { startOfHour, endOfHour };
}
