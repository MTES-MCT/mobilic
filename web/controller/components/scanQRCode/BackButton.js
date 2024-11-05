import React from "react";
import { LinkButton } from "../../../common/LinkButton";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";

export const BackButton = ({ label, route }) => (
  <LinkButton
    to={`${CONTROLLER_ROUTE_PREFIX}${route}`}
    priority="tertiary no outline"
    iconId="fr-icon-arrow-left-s-line"
    iconPosition="left"
  >
    {label}
  </LinkButton>
);
