import { baseApi } from "../config/baseApi";

export interface VietnamProvince {
  code: number;
  name: string;
  division_type: string;
}

export const addressApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getVietnamProvinces: builder.query<VietnamProvince[], void>({
      query: () => ({
        url: "/address/locations/provinces",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetVietnamProvincesQuery } = addressApi;
