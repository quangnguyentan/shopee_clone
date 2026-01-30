export async function uploadImagesInHtml(
  html: string,
  uploadFn: (file: File) => Promise<string>,
): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const images = Array.from(doc.querySelectorAll("img"));
  const uploadedMap = new Map<string, string>();

  for (const img of images) {
    const src = img.getAttribute("src");
    if (!src) continue;

    if (uploadedMap.has(src)) {
      img.setAttribute("src", uploadedMap.get(src)!);
      continue;
    }

    if (src.startsWith("blob:") || src.startsWith("data:")) {
      const file = await fetch(src)
        .then((r) => r.blob())
        .then((b) => new File([b], `desc-${Date.now()}.png`, { type: b.type }));

      const uploadedUrl = await uploadFn(file);
      uploadedMap.set(src, uploadedUrl);
      img.setAttribute("src", uploadedUrl);
    }
  }

  return doc.body.innerHTML;
}
