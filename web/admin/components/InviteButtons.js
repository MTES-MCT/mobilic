import React from "react";
import Box from "@mui/material/Box";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

export function InviteButtons({
  onBatchInvite,
  onSingleInvite,
  shouldShowBadge = false,
  employeeProgressData
}) {
  const shouldShowSingleInviteButton =
    employeeProgressData?.shouldShowSingleInviteButton;

  if (shouldShowSingleInviteButton) {
    return (
      <Button
        size="small"
        onClick={() =>
          onBatchInvite(employeeProgressData?.missingEmployeesCount || 0)
        }
      >
        {employeeProgressData?.shouldShowBadge && (
          <Badge severity="new" small style={{ marginRight: "8px" }}>
            A Faire
          </Badge>
        )}
        Inviter les salariés manquants
      </Button>
    );
  }
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button priority="secondary" size="small" onClick={onBatchInvite}>
        Inviter une liste d'emails
      </Button>
      <Button size="small" onClick={onSingleInvite}>
        {shouldShowBadge && (
          <Badge severity="new" small style={{ marginRight: "8px" }}>
            A Faire
          </Badge>
        )}
        {shouldShowBadge
          ? "Inviter les salariés manquants"
          : "Inviter un nouveau salarié"}
      </Button>
    </Box>
  );
}
