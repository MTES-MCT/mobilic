import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { NonConcurrentExecutionQueue } from "./concurrency";
import Portal from "@mui/material/Portal";

const LoadingScreenContext = React.createContext(() => () => {});

export function LoadingScreenContextProvider({ children }) {
  const loadingFunctionsQueue = React.useState(
    new NonConcurrentExecutionQueue()
  )[0];

  const [
    syncingWithBackendCounter,
    setSyncingWithBackendCounter
  ] = React.useState(0); // We use a counter instead of a boolean because multiple syncs can run simultaneously

  const withLoadingScreen = async (sync, options = {}, nonBlocking = false) => {
    setSyncingWithBackendCounter(currentCounter => currentCounter + 1);
    try {
      if (nonBlocking) await sync();
      else {
        await loadingFunctionsQueue.execute(sync, options);
      }
      setSyncingWithBackendCounter(currentCounter => currentCounter - 1);
    } catch (err) {
      setSyncingWithBackendCounter(currentCounter => currentCounter - 1);
    }
  };

  return (
    <LoadingScreenContext.Provider value={withLoadingScreen}>
      {children}
      <Portal>
        <Backdrop
          open={syncingWithBackendCounter > 0}
          style={{
            position: "fixed",
            zIndex: 9999,
            backdropFilter: "blur(5px)"
          }}
        >
          <CircularProgress color="primary" />
        </Backdrop>
      </Portal>
    </LoadingScreenContext.Provider>
  );
}

export const useLoadingScreen = () => React.useContext(LoadingScreenContext);
