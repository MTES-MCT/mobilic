import React from "react";
import MuiSnackbar from "@mui/material/Snackbar";
import useTheme from "@mui/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Alert from "@mui/material/Alert";
import {
  formatApiError,
  isConnectionError,
  isGraphQLError
} from "common/utils/errors";
import { captureSentryException } from "common/utils/sentry";

function useIsWidthUp(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

const SnackbarContext = React.createContext(() => {});

export const SnackbarProvider = ({ children }) => {
  const [_open, setOpen] = React.useState(false);
  const [_key, setKey] = React.useState(false);
  const [_autoHideDuration, setAutoHideDuration] = React.useState(0);
  const [_message, setMessage] = React.useState(null);
  const [_severity, setSeverity] = React.useState("info");

  const isSmUp = useIsWidthUp("sm");

  function alert(message, severity, key, autoHideDuration) {
    setMessage(message);
    setKey(key || message);
    setSeverity(severity);
    setAutoHideDuration(autoHideDuration);
    setOpen(true);
  }

  function info(message, key = null, autoHideDuration = 0) {
    return alert(message, "info", key, autoHideDuration);
  }

  function error(message, key = null, autoHideDuration = 0) {
    return alert(message, "error", key, autoHideDuration);
  }

  function success(message, key = null, autoHideDuration = 0) {
    return alert(message, "success", key, autoHideDuration);
  }

  function warning(message, key = null, autoHideDuration = 0) {
    return alert(message, "warning", key, autoHideDuration);
  }

  function close() {
    setAutoHideDuration(null);
    setOpen(false);
    setSeverity("info");
    setKey(null);
    setMessage(null);
  }

  async function withApiErrorHandling(
    func,
    name,
    overrideFormatError = null,
    onError = null,
    hideNetworkErrors = false
  ) {
    try {
      await func();
    } catch (err) {
      if (!isGraphQLError(err)) captureSentryException(err);
      if (onError) onError(err);
      if (!isConnectionError(err) || !hideNetworkErrors)
        error(formatApiError(err, overrideFormatError), name, 6000);
    }
  }

  return (
    <SnackbarContext.Provider
      value={{
        info,
        error,
        success,
        warning,
        withApiErrorHandling
      }}
    >
      {children}
      <MuiSnackbar
        key={_key}
        open={_open}
        anchorOrigin={{
          horizontal: isSmUp ? "left" : "center",
          vertical: "bottom"
        }}
        autoHideDuration={_autoHideDuration}
        onClose={close}
      >
        <Alert
          onClose={close}
          elevation={5}
          variant="filled"
          severity={_severity}
          style={{ textAlign: "justify" }}
        >
          {_message}
        </Alert>
      </MuiSnackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbarAlerts = () => React.useContext(SnackbarContext);
