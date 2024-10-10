import React from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";
import MaterialLink from "@mui/material/Link";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function LinkButton(props) {
  const history = useHistory();
  const { trackLink } = useMatomo();

  const { to, href, target, rel, ...otherProps } = props;

  let rootProps = otherProps;
  const linkProps = {
    to: to || href,
    rel,
    target
  };

  if (to) {
    rootProps = {
      ...rootProps,
      onClick: e => {
        e.preventDefault();
        history.push(props.to);
      }
    };
  } else if (href.startsWith("/")) {
    rootProps = {
      ...rootProps,
      onClick: e => {
        e.preventDefault();
        trackLink({ href });
      }
    };
  }

  return <Button {...rootProps} linkProps={linkProps} />;
}

export function Link(props) {
  const { trackLink } = useMatomo();

  if (props.href) {
    const linkProps = { ...props };
    if (props.href.startsWith("/")) {
      const previousOnClick = props.onClick;
      linkProps.onClick = e => {
        trackLink({ href: props.href });
        if (previousOnClick) previousOnClick(e);
      };
    }
    return <MaterialLink {...linkProps} />;
  }
  return <MaterialLink component={RouterLink} {...props} />;
}
