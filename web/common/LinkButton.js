import React from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";

export function LinkButton(props) {
  const history = useHistory();

  return (
    <Button
      onClick={e => {
        e.preventDefault();
        history.push(props.href);
      }}
      {...props}
    />
  );
}
