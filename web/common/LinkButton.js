import React from "react";
import Button from "@material-ui/core/Button";
import { useHistory, Link as RouterLink } from "react-router-dom";
import MaterialLink from "@material-ui/core/Link";
import { useMatomo } from "@datapunt/matomo-tracker-react";

export function LinkButton(props) {
  const history = useHistory();
  const { trackLink } = useMatomo();

  let buttonProps;
  const { to, ...otherProps } = props;

  if (to) {
    buttonProps = {
      href: to,
      onClick: e => {
        e.preventDefault();
        history.push(props.to);
      },
      ...otherProps
    };
  } else if (otherProps.href.startsWith("/")) {
    buttonProps = {
      onClick: e => {
        trackLink({ href: document.domain + otherProps.href });
      },
      ...otherProps
    };
  } else buttonProps = props;

  return <Button {...buttonProps} />;
}

export function Link(props) {
  const { trackLink } = useMatomo();

  if (props.href) {
    const linkProps = { ...props };
    if (props.href.startsWith("/")) {
      const previousOnClick = props.onClick;
      linkProps.onClick = e => {
        trackLink({ href: document.domain + props.href });
        if (previousOnClick) previousOnClick(e);
      };
    }
    return <MaterialLink {...linkProps} />;
  }
  return <MaterialLink component={RouterLink} {...props} />;
}
