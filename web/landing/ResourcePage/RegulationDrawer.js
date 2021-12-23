import React from "react";
import { isWidthDown, withWidth } from "@material-ui/core";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Grid from "@material-ui/core/Grid";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import { RegulationArticlesBlock } from "./RegulationLegalArticle";

export const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: theme.spacing(2)
  },
  horizontalPadding: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(4)
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(3),
    backgroundColor: "rgba(224, 224, 224, 0.5)"
  },
  definitionList: {
    paddingInlineStart: theme.spacing(2)
  },
  definition: {
    marginBottom: theme.spacing(1)
  }
}));

function Section({ title, children, className }) {
  const classes = useStyles();

  return (
    <>
      {title && (
        <Typography
          className={`${classes.sectionTitle} ${classes.horizontalPadding}`}
        >
          {title}
        </Typography>
      )}
      <Box className={`${classes.horizontalPadding} ${className}`}>
        {children}
      </Box>
    </>
  );
}

export const RegulationDrawer = withWidth()(
  ({ rule, width, open, handleClose }) => {
    const classes = useStyles();

    return (
      <SwipeableDrawer
        anchor="right"
        open={open}
        disableSwipeToOpen
        disableDiscovery
        onOpen={() => {}}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: isWidthDown("xs", width) ? "100vw" : 400
          }
        }}
      >
        {rule && (
          <Container maxWidth={false} className={classes.container}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              wrap="nowrap"
              className={`${classes.title} ${classes.horizontalPadding}`}
            >
              <Grid item>
                <IconButton
                  onClick={handleClose}
                  className="no-margin-no-padding"
                >
                  <ChevronLeftIcon viewBox="6 0 24 24" />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h3">{rule.name}</Typography>
              </Grid>
            </Grid>
            <Section className={classes.details}>
              <Typography variant="body2">{rule.details}</Typography>
            </Section>
            {rule.definitions && rule.definitions.length > 0 && (
              <Section className={classes.definitions} title="Définitions">
                <ul className={classes.definitionList}>
                  {rule.definitions.map((def, index) => (
                    <li key={index}>
                      <Typography
                        variant="body2"
                        className={classes.definition}
                      >
                        <span className="bold">{def.name}</span> : {def.content}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {rule.articles && (
              <Section title="Articles de loi">
                <RegulationArticlesBlock
                  className={classes.definitionList}
                  articles={rule.articles}
                />
              </Section>
            )}
          </Container>
        )}
      </SwipeableDrawer>
    );
  }
);
