export const normalizeVNPhone = (value: string) => {
  if (!value) return "";

  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = phone.slice(1);
  }

  if (!phone.startsWith("84")) {
    phone = `84${phone}`;
  }

  return `+${phone}`;
};
