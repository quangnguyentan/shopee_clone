import { baseApi } from "../config/baseApi";

export const assetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadAsset: builder.mutation<
      { url: string },
      { file: File; type: "product" | "avatar" | "shop" | "category" }
    >({
      query: ({ file, type }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/assets/upload?type=${type}`,
          method: "POST",
          data: formData,
        };
      },
    }),
  }),
});

export const { useUploadAssetMutation } = assetApi;
