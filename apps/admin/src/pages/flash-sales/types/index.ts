import type { UploadFileWithExtra } from "@/components/Uploader";

export type ShopFormValues = {
  name: string;
  description: string;
  is_active: boolean;
  rating?: number;
  user_id?: number; // ✅ admin chọn owner
  logo?: UploadFileWithExtra[];
};
