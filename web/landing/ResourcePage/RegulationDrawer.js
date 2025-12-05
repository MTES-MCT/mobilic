import React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Grid from "@mui/material/Grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { RegulationArticlesBlock } from "./RegulationLegalArticle";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Stack } from "@mui/material";

export const useStyles = makeStyles((theme) => ({
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

export const RegulationBlock = ({ rule }) => {
  const classes = useStyles();
  return (
    <Box className={classes.computationDetails}>
      <Accordion label="Méthode de calcul" className="info">
        {rule.computation}
      </Accordion>
    </Box>
  );
};

const RegulationDrawerContext = React.createContext(() => {});

export const RegulationDrawerContextProvider = ({ children }) => {
  const classes = useStyles();

  const [rule, setRule] = React.useState(null);
  const [displayComputationDetails, setDisplayComputationDetails] =
    React.useState(false);

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
        ModalProps={{ sx: { zIndex: 1510 } }}
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
            <Stack direction="column" rowGap={4}>
              <Section>
                {displayComputationDetails && rule.computation && (
                  <RegulationBlock rule={rule} />
                )}
                <Box>{rule.details}</Box>
              </Section>
              {rule.definitions && rule.definitions.length > 0 && (
                <Section className={classes.definitions} title="Définitions">
                  <ul className={classes.definitionList}>
                    {rule.definitions.map((def, index) => (
                      <li key={index} className={classes.definition}>
                        <span className="bold">{def.name}</span> : {def.content}
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
            </Stack>
          </Container>
        )}
      </SwipeableDrawer>
    </RegulationDrawerContext.Provider>
  );
};

export const useRegulationDrawer = () =>
  React.useContext(RegulationDrawerContext);
