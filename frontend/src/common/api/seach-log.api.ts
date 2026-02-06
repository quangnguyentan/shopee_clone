import { baseApi } from "../config/baseApi";

export interface SearchKeyword {
  keyword: string;
  count: number;
}

export const searchLogApi = baseApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    /** Ghi log keyword */
    createSearchLog: builder.mutation<void, { keyword: string }>({
      query: (body) => ({
        url: "/search-logs",
        method: "POST",
        data: body,
      }),
    }),

    /** Top keyword hôm nay (analytics / debug) */
    getTodayTopSearch: builder.query<SearchKeyword[], number | void>({
      query: (limit = 10) => ({
        url: "/search-logs/top/today",
        method: "GET",
        params: { limit },
      }),
    }),

    /** Suggest keyword khi gõ */
    suggestKeyword: builder.query<SearchKeyword[], string>({
      query: (q) => ({
        url: "/search-logs/suggest",
        method: "GET",
        params: { q },
      }),
    }),
  }),
});

export const {
  useCreateSearchLogMutation,
  useGetTodayTopSearchQuery,
  useSuggestKeywordQuery,
} = searchLogApi;
