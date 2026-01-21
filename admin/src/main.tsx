import "./index.css";
import "@/styles/sidebar.css";
import "./chart";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./common/storage";
import { router } from "./routes";
import { injectStore } from "./common/config/axios";
import Loading from "./components/Loading";
import AuthBootstrap from "./components/AuthBootstrap";

injectStore(store);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <AuthBootstrap>
          <RouterProvider router={router} />
        </AuthBootstrap>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
