import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  sectionTitle: {
    marginBottom: theme.spacing(2)
  },
  smallTextButton: {
    fontSize: "0.7rem"
  }
}));

export function MissionDetailsSection({
  className,
  children,
  title,
  action,
  actionButtonLabel
}) {
  const classes = useStyles();

  return (
    <Box py={4} className={className}>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        className={classes.sectionTitle}
      >
        <Grid item>
          <Typography variant="h3">{title}</Typography>
        </Grid>
        {action && (
          <Grid item>
            <Button
              aria-label={actionButtonLabel}
              color="primary"
              variant="outlined"
              size="small"
              className={classes.smallTextButton}
              onClick={action}
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
