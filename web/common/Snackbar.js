import React from "react";
import MuiSnackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { formatApiError, isGraphQLError } from "common/utils/errors";
import { captureSentryException } from "common/utils/sentry";

const SnackbarContext = React.createContext(() => {});

export const SnackbarProvider = withWidth()(({ children, width }) => {
  const [_open, setOpen] = React.useState(false);
  const [_key, setKey] = React.useState(false);
  const [_autoHideDuration, setAutoHideDuration] = React.useState(0);
  const [_message, setMessage] = React.useState(null);
  const [_severity, setSeverity] = React.useState("info");

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
    onError = null
  ) {
    try {
      await func();
    } catch (err) {
      if (!isGraphQLError(err)) captureSentryException(err);
      if (onError) onError(err);
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
          horizontal: isWidthUp("sm", width) ? "left" : "center",
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
});

export const useSnackbarAlerts = () => React.useContext(SnackbarContext);
