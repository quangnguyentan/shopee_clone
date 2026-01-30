import { createApi } from "@reduxjs/toolkit/query/react";
import type { ProductImageResult } from "../types/product-image.type";
import { assetApiClient } from "../config/assetApi";
import type { AssetType, DescriptionImageResult } from "../types/asset.type";

export const assetApi = createApi({
  reducerPath: "assetApi",
  baseQuery: async ({ url, method, body }) => {
    try {
      const res = await assetApiClient.request({
        url,
        method,
        data: body,
      });

      return { data: res.data };
    } catch (error: A) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data,
        },
      };
    }
  },
  endpoints: (builder) => ({
    uploadAsset: builder.mutation<
      ProductImageResult[],
      { files: File[]; type: AssetType }
    >({
      query: ({ files, type }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: `/assets/upload?type=${type}`,
          method: "POST",
          body: formData,
        };
      },
    }),
    uploadDescriptionImages: builder.mutation<
      DescriptionImageResult,
      { files: File[] }
    >({
      query: ({ files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        return {
          url: `/assets/upload?type=product-description`,
          method: "POST",
          body: formData,
        };
      },
    }),
    uploadSingleAsset: builder.mutation<
      { url: string },
      { file: File; type: AssetType }
    >({
      query: ({ file, type }) => {
        const formData = new FormData();
        formData.append("files", file);

        return {
          url: `/assets/upload?type=${type}`,
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useUploadAssetMutation,
  useUploadSingleAssetMutation,
  useUploadDescriptionImagesMutation,
} = assetApi;
