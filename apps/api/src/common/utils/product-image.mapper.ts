export function mapProductImageVariants(url: string) {
  const uploadSegment = '/image/upload/';
  const uploadIndex = url.indexOf(uploadSegment);

  if (uploadIndex >= 0) {
    const prefix = url.slice(0, uploadIndex + uploadSegment.length);
    const versionedPublicId = url.slice(uploadIndex + uploadSegment.length);
    return {
      original: url,
      thumbnail: `${prefix}c_fill,w_320,h_320,q_80,f_webp/${versionedPublicId}`,
      small: `${prefix}c_fill,w_180,h_180,q_70,f_webp/${versionedPublicId}`,
    };
  }

  const dotIndex = url.lastIndexOf('.');
  const base = url.slice(0, dotIndex);

  return {
    original: url,
    thumbnail: `${base}_tn.webp`,
    small: `${base}_sm.webp`,
  };
}
