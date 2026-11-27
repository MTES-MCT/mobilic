import React from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { useIsAdmin } from "../../common/hooks/useIsAdmin";

export default function BecomeAdmin({ hasEmployments = true, ...otherProps }) {
  const { isAdmin } = useIsAdmin();

  if (isAdmin) {
    return null;
  }
  return (
    <Box {...otherProps}>
      <Link
        to="/signup/company"
        className={fr.cx(
          "fr-link",
          "fr-link--icon-right",
          "fr-icon-arrow-right-line"
        )}
      >
        {hasEmployments
          ? "Devenir gestionnaire d'une autre entreprise"
          : "Devenir gestionnaire d'une entreprise"}
      </Link>
    </Box>
  );
}
