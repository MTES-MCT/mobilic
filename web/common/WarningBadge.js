import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

export function WarningBadge({ children, className }) {
  return (
    <Badge severity="warning" noIcon small className={className}>
      {children}
    </Badge>
  );
}
