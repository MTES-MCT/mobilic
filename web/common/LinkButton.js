import React from "react";
import Button from "@material-ui/core/Button";
import { useHistory, Link as RouterLink } from "react-router-dom";
import MaterialLink from "@material-ui/core/Link";

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

export function Link(props) {
  if (props.href) {
    return <MaterialLink {...props} />;
  }
  return <MaterialLink component={RouterLink} {...props} />;
}
