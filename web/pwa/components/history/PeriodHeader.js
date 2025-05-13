import React from "react";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: "16px 16px 0 0",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    color: "white"
  }
}));

export function PeriodHeader({ title1 = "", title2 = "", children }) {
  const classes = useStyles();
  return (
    <Stack className={classes.header} direction="column" rowGap={3}>
      {(title1 || title2) && (
        <Box>
          {title1 && (
            <Typography className={classes.title}>{title1}</Typography>
          )}
          {title2 && (
            <Typography className={classes.title}>{title2}</Typography>
          )}
        </Box>
      )}
      {children}
    </Stack>
  );
}
