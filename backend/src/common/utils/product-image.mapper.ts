export function mapProductImageVariants(url: string) {
  const dotIndex = url.lastIndexOf('.');
  const base = url.slice(0, dotIndex);
  const ext = url.slice(dotIndex); // .jpg / .png

  return {
    original: url,
    thumbnail: `${base}_tn.webp`,
    small: `${base}_sm.webp`,
  };
}
