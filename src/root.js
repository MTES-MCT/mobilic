import React from "react";

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
        <ApiContextProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ModalProvider modalDict={MODAL_DICT}>
              <_Root />
            </ModalProvider>
          </ThemeProvider>
        </ApiContextProvider>
      </StoreSyncedWithLocalStorageProvider>
    </div>
  );
}

function _Root() {
  const [signUpInsteadOfLogging, setSignUpInsteadOfLogging] = React.useState(
    false
  );
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const userId = storeSyncedWithLocalStorage.userId();
  const isCompanyAdmin = storeSyncedWithLocalStorage.companyAdmin();

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, [userId]);

  if (!userId && signUpInsteadOfLogging)
    return <Signup setSignUpInsteadOfLogging={setSignUpInsteadOfLogging} />;
  if (!userId && !signUpInsteadOfLogging)
    return <Login setSignUpInsteadOfLogging={setSignUpInsteadOfLogging} />;
  if (userId && !isCompanyAdmin) return <App />;
  if (userId && isCompanyAdmin) return <Admin />;
}
