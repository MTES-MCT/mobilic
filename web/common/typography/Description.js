import Typography from "@mui/material/Typography";
import React from "react";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fr } from "@codegouvfr/react-dsfr";

export const Description = ({ children, className, style, ...otherProps }) => {
  return (
    <Typography
      className={cx(fr.cx("fr-text--sm"), className)}
      style={{
        ...style,
        color: fr.colors.decisions.text.mention.grey.default
      }}
      {...otherProps}
    >
      {children}
    </Typography>
  );
};
