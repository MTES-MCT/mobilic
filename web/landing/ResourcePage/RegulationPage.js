import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RegulationCard } from "./RegulationCard";
import { makeStyles } from "@mui/styles";
import { REGULATION_RULES } from "./RegulationRules";
import { useRegulationDrawer } from "./RegulationDrawer";
import { useHistory, useLocation } from "react-router-dom";
import { findKey } from "lodash";
import { usePageTitle } from "../../common/UsePageTitle";

const useStyles = makeStyles(theme => ({
  ruleScope: {
    fontStyle: "italic",
    display: "block",
    marginBottom: theme.spacing(2)
  }
}));

export function RegulationPage() {
  usePageTitle("Réglementation - Mobilic");
  const classes = resourcePagesClasses();
  const history = useHistory();

  const otherClasses = useStyles();
  const openRegulationDrawer = useRegulationDrawer();
  const location = useLocation();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const ruleInUrl = queryString.get("regle");

    openRegulationDrawer(
      REGULATION_RULES[findKey(REGULATION_RULES, { url: ruleInUrl })],
      false
    );
  }, [location]);

  return [
    <Header key={1} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth={false}
    >
      <Container maxWidth="lg" className={classes.inner}>
        <Breadcrumb
          currentPageLabel="Réglementation"
          homeLinkProps={{
            to: "/"
          }}
          segments={[
            {
              label: "Documentation",
              linkProps: {
                to: "/resources/home"
              }
            }
          ]}
        />
        <PaperContainerTitle variant="h1" className={classes.title}>
          La réglementation du temps de travail dans le transport routier léger
        </PaperContainerTitle>
        <Typography variant="caption" className={otherClasses.ruleScope}>
          Les règles suivantes concernent le personnel roulant du transport
          léger soumis au livret individuel de contrôle selon les articles
          R3312-19 et R3312-58 du Code des transports : salariés du transport
          routier de marchandises (TRM) : longue distance, courte distance,
          messagerie, fonds et valeurs ; et du transport routier de voyageurs
          (TRV) : lignes régulières et occasionel. Par ailleurs, les dérogations
          ou règles spécifiques à certains secteurs ne sont pas précisées. Les
          conducteurs soumis au règlement (CE) n°561/2006 sont, d'autre part,
          soumis aux seuils de ce règlement pour les dispositions en matière de
          durée des repos et de temps de conduite.
        </Typography>
        <Grid container direction="row" alignItems="stretch" spacing={6}>
          {Object.values(REGULATION_RULES).map((rule, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <RegulationCard
                rule={rule}
                onClick={() =>
                  history.push("/resources/regulations?regle=" + rule.url)
                }
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Container>,
    <Footer key={4} />
  ];
}
