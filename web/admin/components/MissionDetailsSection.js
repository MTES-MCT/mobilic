import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import React from "react";

export function MissionDetailsSection({
  className,
  children,
  title,
  action,
  actionButtonLabel,
  actionProps = {},
  titleProps = {}
}) {
  return (
    <Box py={4} className={className}>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Grid item>
          <Typography variant="h4" {...titleProps}>
            {title}
          </Typography>
        </Grid>
        {action && (
          <Grid item>
            <Button
              priority="secondary"
              size="small"
              onClick={action}
              {...actionProps}
            >
              {actionButtonLabel}
            </Button>
          </Grid>
        )}
      </Grid>
      {children}
    </Box>
  );
}
