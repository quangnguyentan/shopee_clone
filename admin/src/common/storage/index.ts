import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import userReducer from "./user.slice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authApi } from "../api";
import { assetApi } from "../api/asset.api";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
  [assetApi.reducerPath]: assetApi.reducer,
});

const persistConfig = {
  key: "root:admin",
  storage,
  whitelist: ["auth", "user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, assetApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
