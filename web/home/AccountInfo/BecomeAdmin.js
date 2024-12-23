import React from "react";
import { makeStyles } from "@mui/styles";
import { LinkButton } from "../../common/LinkButton";
import { Box } from "@mui/material";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";

const useStyles = makeStyles(() => ({
  textButton: {
    textTransform: "none",
    textDecoration: "underline",
    fontSize: "1rem",
    fontWeight: "400"
  }
}));

export default function BecomeAdmin({ hasEmployments = true, ...otherProps }) {
  const classes = useStyles();
  const { isAdmin } = useIsAdmin();

  if (isAdmin) {
    return null;
  }
  return (
    <Box {...otherProps}>
      <LinkButton to="/signup/company" className={classes.textButton}>
        {hasEmployments
          ? "Je souhaite devenir gestionnaire d'une autre entreprise"
          : "Je souhaite devenir gestionnaire d'une entreprise"}
      </LinkButton>
    </Box>
  );
}
