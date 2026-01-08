"use client";
import { Provider } from "react-redux";
import { persistor, store } from "@/src/common/storage";
import { PersistGate } from "redux-persist/integration/react";
import { Loading } from "@/src/components/shared/Loading";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
