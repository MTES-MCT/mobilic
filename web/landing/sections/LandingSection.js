import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const useSectionStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  sectionTitle: {
    paddingBottom: theme.spacing(6),
    fontWeight: "bold",
    fontSize: "1.8rem"
  },
  sectionIntroText: {
    paddingBottom: theme.spacing(4),
    maxWidth: 600,
    margin: "auto",
    textAlign: "justify"
  },
  sectionSubtitle: {
    textAlign: "left",
    marginBottom: theme.spacing(2)
  },
  pressSubsection: {
    textAlign: "left",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  pressArticles: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export function LandingSectionList({ children }) {
  const classes = useSectionStyles();

  return React.Children.toArray(children)
    .filter(Boolean)
    .map((section, index) =>
      React.cloneElement(section, {
        className: index % 2 === 1 ? classes.whiteSection : ""
      })
    );
}

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
