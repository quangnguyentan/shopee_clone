"use client";
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/auth.api";
import authReducer from "./auth.slice";
import userReducer from "./user.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
