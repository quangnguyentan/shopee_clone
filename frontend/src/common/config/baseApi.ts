import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axios";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: [],
});

export type StaffGeneratedApi = typeof baseApi;
