import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import "common/assets/fonts/Evolventa/Evolventa-Bold.ttf";
import "common/assets/fonts/Evolventa/Evolventa-BoldOblique.ttf";
import "common/assets/fonts/Evolventa/Evolventa-Oblique.ttf";
import "common/assets/fonts/Evolventa/Evolventa-Regular.ttf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-Bold.otf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-It.otf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-Regular.otf";

import "./index.css";
import "common/assets/styles/root.scss";

import App from "common/components/App";
import Login from "./landing/login";
import Signup from "./landing/signup";
import {
  StoreSyncedWithLocalStorageProvider,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import { ApiContextProvider, useApi } from "common/utils/api";
import { Admin } from "./admin/Admin";
import { theme } from "common/utils/theme";
import { MODAL_DICT } from "./modals";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { loadUserData } from "common/utils/loadUserData";
import Container from "@material-ui/core/Container";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import frLocale from "date-fns/locale/fr";
import { FrLocalizedUtils } from "common/utils/time";
import { ActionsContextProvider } from "common/utils/actions";
import { ScreenWithBottomNavigation } from "./pwa/utils/navigation";
import { ModalProvider } from "common/utils/modals";

export default function Root() {
  return (
    <Container className="root-container" maxWidth={false}>
      <StoreSyncedWithLocalStorageProvider storage={localStorage}>
        <Router>
          <ApiContextProvider>
            <ActionsContextProvider>
              <MuiPickersUtilsProvider
                utils={FrLocalizedUtils}
                locale={frLocale}
              >
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <ModalProvider modalDict={MODAL_DICT}>
                    <_Root />
                  </ModalProvider>
                </ThemeProvider>
              </MuiPickersUtilsProvider>
            </ActionsContextProvider>
          </ApiContextProvider>
        </Router>
      </StoreSyncedWithLocalStorageProvider>
    </Container>
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
          <Route exact key="app" path="/app">
            <App ScreenComponent={ScreenWithBottomNavigation} />
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
        <Route exact key="signup" path="/signup">
          <Signup />
        </Route>,
        <Route exact key="login" path="/">
          <Login />
        </Route>,
        <Redirect push key="*" from="*" to="/" />
      ]}
    </Switch>
  );
}
