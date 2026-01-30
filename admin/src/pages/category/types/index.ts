import type { UploadFileWithExtra } from "@/components/Uploader";

export type CategoryFormValues = {
  name: string;
  imageUrl?: UploadFileWithExtra[];
  parent_id?: number;
};
