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
import { ApiContextProvider } from "./common/utils/api";
import { Admin } from "./admin/Admin";

export default function Root() {
  return (
    <div className="Root">
      <StoreSyncedWithLocalStorageProvider>
        <ApiContextProvider>
          <_Root />
        </ApiContextProvider>
      </StoreSyncedWithLocalStorageProvider>
    </div>
  );
}

function _Root() {
  const [signUpInsteadOfLogging, setSignUpInsteadOfLogging] = React.useState(
    false
  );
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const userId = storeSyncedWithLocalStorage.userId();
  const isCompanyAdmin = storeSyncedWithLocalStorage.companyAdmin();

  if (!userId && signUpInsteadOfLogging)
    return <Signup setSignUpInsteadOfLogging={setSignUpInsteadOfLogging} />;
  if (!userId && !signUpInsteadOfLogging)
    return <Login setSignUpInsteadOfLogging={setSignUpInsteadOfLogging} />;
  if (userId && !isCompanyAdmin) return <App />;
  if (userId && isCompanyAdmin) return <Admin />;
}
