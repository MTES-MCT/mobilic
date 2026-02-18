import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const useSectionStyles = makeStyles((theme) => ({
  sectionTitle: {
    paddingBottom: theme.spacing(6),
    fontWeight: "bold",
    fontSize: "1.8rem",
  },
}));

export function LandingSection({
  title,
  className,
  innerWidth,
  titleProps = {},
  children,
  ...props
}) {
  const classes = useSectionStyles();

  return (
    <Box className={className} {...props}>
      <Typography
        variant="h3"
        className={`${classes.sectionTitle}`}
        {...titleProps}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
