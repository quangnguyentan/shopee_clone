export const extractUploadedImageUrl = (uploaded: A): string | null => {
  if (!uploaded) return null;

  return (
    uploaded.images?.original ||
    uploaded.original ||
    uploaded.url ||
    uploaded.path ||
    null
  );
};
