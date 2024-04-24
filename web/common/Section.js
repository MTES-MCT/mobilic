import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  section: {
    width: "100%"
  },
  sectionTitle: {
    marginBottom: theme.spacing(3),
    textAlign: "left"
  }
}));

export const Section = React.forwardRef((props, ref) => {
  const classes = useStyles();

  return (
    <Box ref={ref} my={6} mb={props.last ? 0 : 6} className={classes.section}>
      <Typography
        className={classes.sectionTitle}
        variant="h5"
        component={props.component || undefined}
      >
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
});
