function normalize(text: string) {
  return text
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');
}

export function generateSKU({
  shopName,
  productName,
  options,
}: {
  shopName: string;
  productName: string;
  options: string[];
}) {
  return [
    normalize(shopName),
    normalize(productName),
    ...options.map(normalize),
  ].join('-');
}
