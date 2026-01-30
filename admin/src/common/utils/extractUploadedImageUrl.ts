const extractUploadedImageUrl = (uploaded: any): string | null => {
  if (!uploaded) return null;

  return (
    uploaded.images?.original ||
    uploaded.original ||
    uploaded.url ||
    uploaded.path ||
    null
  );
};
