import dayjs from "dayjs";

export const convertDay = (value: string) =>
  dayjs(value).format("DD/MM/YYYY HH:mm");
