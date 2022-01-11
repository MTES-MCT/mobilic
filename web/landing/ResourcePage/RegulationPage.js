import React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { Header } from "../../common/Header";
import { Footer } from "../footer";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { Breadcrumbs } from "@material-ui/core";
import { Link } from "../../common/LinkButton";
import { resourcePagesClasses } from "./styles/ResourcePagesStyle";
import { RegulationCard } from "./RegulationCard";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { REGULATION_RULES } from "./RegulationRules";
import { useRegulationDrawer } from "./RegulationDrawer";
import { useHistory, useLocation } from "react-router-dom";
import { findKey } from "lodash";

const useStyles = makeStyles(theme => ({
  ruleScope: {
    fontStyle: "italic",
    display: "block",
    marginBottom: theme.spacing(2)
  }
}));

export function RegulationPage() {
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
        <Breadcrumbs>
          <Link color="inherit" to="/resources/home">
            Documentation
          </Link>
          <Typography>Réglementation</Typography>
        </Breadcrumbs>
        <PaperContainerTitle variant="h1" className={classes.title}>
          La réglementation du temps de travail dans le transport routier léger
        </PaperContainerTitle>
        <Typography variant="caption" className={otherClasses.ruleScope}>
          Les règles suivantes concernent le personnel roulant soumis au livret
          individuel de contrôle et ne sont pas forcément applicables aux autres
          personnels des entreprises de transport routier. Par ailleurs les
          dérogations ou règles propres à chaque secteur (déménagement,
          messagerie, ...) ne sont pas précisées. Les conducteurs soumis au
          règlement (CE) n°561/2006 sont par ailleurs soumis aux seuils de ce
          règlement.
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
