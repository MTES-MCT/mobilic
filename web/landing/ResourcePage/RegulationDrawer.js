import React from "react";
import { Accordion, AccordionDetails, Alert } from "@mui/material";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { RegulationArticlesBlock } from "./RegulationLegalArticle";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: theme.spacing(2),
    overflowX: "hidden"
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
    backgroundColor: theme.palette.grey[200]
  },
  definitionList: {
    paddingInlineStart: theme.spacing(2)
  },
  definition: {
    marginBottom: theme.spacing(1)
  },
  computationDetails: {
    marginBottom: theme.spacing(2)
  },
  collapse: {
    display: "block",
    background: "inherit",
    padding: 0,
    marginTop: theme.spacing(2)
  },
  accordion: {
    "&::before": {
      content: "none"
    },
    "&.Mui-disabled": {
      background: "inherit"
    },
    background: "inherit"
  },
  accordionTitle: {
    padding: 0,
    fontWeight: "bold",
    minHeight: "unset",
    margin: 0,
    "& .MuiAccordionSummary-content": {
      margin: 0
    },
    "&.Mui-expanded": {
      minHeight: "unset",
      margin: 0,
      backgroundColor: "inherit"
    }
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

const RegulationDrawerContext = React.createContext(() => {});

export const RegulationDrawerContextProvider = ({ children }) => {
  const classes = useStyles();

  const [rule, setRule] = React.useState(null);
  const [
    displayComputationDetails,
    setDisplayComputationDetails
  ] = React.useState(false);

  function openDrawer(rule_, shouldDisplayComputationDetails = false) {
    setRule(rule_);
    setDisplayComputationDetails(shouldDisplayComputationDetails);
  }

  return (
    <RegulationDrawerContext.Provider value={openDrawer}>
      {children}
      <SwipeableDrawer
        anchor="right"
        open={!!rule}
        disableSwipeToOpen
        disableDiscovery
        onOpen={() => {}}
        onClose={() => setRule(null)}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 400 } } }}
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
                  onClick={() => setRule(null)}
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
              {displayComputationDetails && rule.computation && (
                <Alert severity="info" className={classes.computationDetails}>
                  <Accordion elevation={0} className={classes.accordion}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className={classes.accordionTitle}
                    >
                      Méthode de calcul
                    </AccordionSummary>
                    <AccordionDetails className={classes.collapse}>
                      {rule.computation}
                    </AccordionDetails>
                  </Accordion>
                </Alert>
              )}
              <Box>{rule.details}</Box>
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
              <Section title="Réglementation">
                <RegulationArticlesBlock
                  className={classes.definitionList}
                  articles={rule.articles}
                />
              </Section>
            )}
          </Container>
        )}
      </SwipeableDrawer>
    </RegulationDrawerContext.Provider>
  );
};

export const useRegulationDrawer = () =>
  React.useContext(RegulationDrawerContext);
