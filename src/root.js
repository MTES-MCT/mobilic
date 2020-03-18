import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import "./index.css";
import "./root.css";

import App from "./app/App";
import Login from "./landing/login";
import Signup from "./landing/signup";
import {
  StoreSyncedWithLocalStorageProvider,
  useStoreSyncedWithLocalStorage
} from "./common/utils/store";
import { ApiContextProvider, useApi } from "./common/utils/api";
import { Admin } from "./admin/Admin";
import { theme } from "./common/utils/theme";
import { MODAL_DICT, ModalProvider } from "./common/utils/modals";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { loadUserData } from "./common/utils/loadUserData";

export default function Root() {
  return (
    <div className="Root">
      <StoreSyncedWithLocalStorageProvider>
        <Router>
          <ApiContextProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ModalProvider modalDict={MODAL_DICT}>
                <_Root />
              </ModalProvider>
            </ThemeProvider>
          </ApiContextProvider>
        </Router>
      </StoreSyncedWithLocalStorageProvider>
    </div>
  );
}

function _Root() {
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const userId = storeSyncedWithLocalStorage.userId();
  const isCompanyAdmin = storeSyncedWithLocalStorage.companyAdmin();

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, [userId]);

  return (
    <Switch>
      {userId &&
        !isCompanyAdmin && [
          <Route key="app" path="/app">
            <App />
          </Route>,
          <Redirect push key="*" from="*" to="/app" />
        ]}
      {userId &&
        isCompanyAdmin && [
          <Route key="admin" path="/admin">
            <Admin />
          </Route>,
          <Redirect push key="*" from="*" to="/admin" />
        ]}
      {!userId && [
        <Route key="signup" path="/signup">
          <Signup />
        </Route>,
        <Route key="login" path="/">
          <Login />
        </Route>,
        <Redirect push key="*" from="*" to="/" />
      ]}
    </Switch>
  );
}
