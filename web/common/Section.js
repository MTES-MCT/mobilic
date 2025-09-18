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
    <Box ref={ref} className={classes.section}>
      <Typography
        className={classes.sectionTitle}
        variant="h4"
        component={props.component}
      >
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
});
