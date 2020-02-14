import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import "./root.css";

import App from "./app/App";
import * as serviceWorker from "./serviceWorker";
import Login from "./landing/login";
import Signup from "./landing/signup";
import {
  StoreSyncedWithLocalStorageProvider,
  useStoreSyncedWithLocalStorage
} from "./common/utils/store";
import { ApiContextProvider } from "./common/utils/api";

function Root() {
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

  if (!userId && signUpInsteadOfLogging) return <Signup />;
  if (!userId && !signUpInsteadOfLogging)
    return <Login setSignUpInsteadOfLogging={setSignUpInsteadOfLogging} />;
  if (userId && !isCompanyAdmin) return <App />;
}

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
