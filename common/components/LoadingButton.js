import React from "react";
import omit from "lodash/omit";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

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
      <span style={{ position: "relative", visibility: isLoading && "hidden" }}>
        {props.children}
      </span>
      {isLoading && (
        <CircularProgress
          style={{ position: "absolute" }}
          color="inherit"
          size="1rem"
        />
      )}
    </Button>
  );
}
