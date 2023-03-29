import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";

export const useSectionStyles = makeStyles(theme => ({
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  section: {
    paddingTop: theme.spacing(7),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: 0
  },
  sectionTitle: {
    paddingBottom: theme.spacing(6)
  },
  sectionIntroText: {
    paddingBottom: theme.spacing(4),
    maxWidth: 600,
    margin: "auto",
    textAlign: "justify"
  },
  sectionHPadding: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5)
  },
  inner: {
    margin: "auto",
    padding: 0
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

export function LandingSection({ title, className, children, ...props }) {
  const classes = useSectionStyles();

  return (
    <Container
      className={`${classes.section} ${className}`}
      maxWidth={false}
      {...props}
    >
      <Container maxWidth="md" className={classes.inner}>
        <Typography variant="h3" className={`${classes.sectionTitle}`}>
          {title}
        </Typography>
        {children}
      </Container>
    </Container>
  );
}
