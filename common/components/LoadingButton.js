import React from "react";
import omit from "lodash/omit";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function LoadingButton(props) {
  const [loading, setLoading] = React.useState(false);

  async function onClick(e) {
    if (props.loading !== undefined) {
      await props.onClick(e);
      return;
    }
    setLoading(true);
    try {
      await props.onClick(e);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  const isLoading = props.loading !== undefined ? props.loading : loading;

  return (
    <Button
      onClick={props.onClick ? onClick : null}
      {...omit(props, ["loading", "onClick"])}
      disabled={props.disabled || isLoading}
    >
      <span
        style={{
          position: "relative",
          display: isLoading && props.loadingLabel && "none",
          visibility: isLoading && !props.loadingLabel && "hidden"
        }}
      >
        {props.children}
      </span>
      {isLoading && props.loadingLabel && (
        <Box
          sx={{ display: "flex", alignItems: "center", textTransform: "none" }}
        >
          <Typography mr={2}>{props.loadingLabel}</Typography>
          <CircularProgress color="inherit" size="1rem" />
        </Box>
      )}
      {isLoading && !props.loadingLabel && (
        <CircularProgress
          style={{ position: "absolute" }}
          color="inherit"
          size="1rem"
        />
      )}
    </Button>
  );
}
