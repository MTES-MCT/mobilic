import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop/Backdrop";

const LoadingScreenContext = React.createContext(() => () => {});

export function LoadingScreenContextProvider({ children }) {
  const [
    syncingWithBackendCounter,
    setSyncingWithBackendCounter
  ] = React.useState(0); // We use a counter instead of a boolean because multiple syncs can run simultaneously

  const withLoadingScreen = async sync => {
    setSyncingWithBackendCounter(currentCounter => currentCounter + 1);
    try {
      await sync();
      setSyncingWithBackendCounter(currentCounter => currentCounter - 1);
    } catch (err) {
      setSyncingWithBackendCounter(currentCounter => currentCounter - 1);
      console.log(err);
    }
  };

  return (
    <LoadingScreenContext.Provider value={withLoadingScreen}>
      {children}
      <Backdrop open={syncingWithBackendCounter > 0} style={{ zIndex: 5000 }}>
        <CircularProgress color="primary" />
      </Backdrop>
    </LoadingScreenContext.Provider>
  );
}

export const useLoadingScreen = () => React.useContext(LoadingScreenContext);
