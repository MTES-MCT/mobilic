import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { Link } from "../common/LinkButton";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Grid from "@mui/material/Grid";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../common/Snackbar";
import { useApi } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";
import { CertificationImage } from "common/utils/icons";
import Box from "@mui/material/Box";
import { usePageTitle } from "../common/UsePageTitle";
import { Input } from "../common/forms/Input";
import Notice from "../common/Notice";
import { Main } from "../common/semantics/Main";

const useStyles = makeStyles(theme => ({
  explanation: {
    marginTop: theme.spacing(8),
    textAlign: "left"
  },
  linkExplanation: {
    textAlign: "left"
  },
  searchBar: {
    marginRight: "auto",
    marginLeft: "auto",
    width: "80%",
    [theme.breakpoints.up("md")]: {
      width: "70%"
    }
  },
  certificationImage: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  }
}));

export function Certificate() {
  usePageTitle("Certificat - Mobilic");
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const [inputErrorMessage, setInputErrorMessage] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchDone, setSearchDone] = React.useState(false);

  const onSearch = async () => {
    const cleanSearchInput = searchInput?.replace(/[. -]/g, "");
    if (cleanSearchInput?.length < 2) {
      setInputErrorMessage(
        "Votre recherche doit comporter au moins deux caractères alphanumériques."
      );
    } else {
      setInputErrorMessage("");
      try {
        const certifiedCompanies = await api.jsonHttpQuery(
          HTTP_QUERIES.certificateSearch,
          { json: { search_input: searchInput } },
          true
        );
        setSearchResults(certifiedCompanies);
        setSearchDone(true);
      } catch (err) {
        alerts.error(
          "Une erreur s'est produite lors de la recherche, veuillez réessayer plus tard.",
          "",
          5000
        );
        captureSentryException(err);
      }
    }
  };

  return (
    <>
      <Header />
      <Main sx={{ marginBottom: 15 }}>
        <Container maxWidth="xl" sx={{ textAlign: "center" }}>
          <Typography variant="h1" mt={10}>
            Les entreprises certifiées
          </Typography>
          <Typography mt={4} className={classes.explanation}>
            Le certificat, fourni par l'équipe Mobilic, atteste du fait qu'une
            entreprise se plie à la réglementation de suivi du temps de travail
            et, pour cela, utilise Mobilic de manière conforme. L'attestation
            est valable pour une durée de 6 mois.
          </Typography>
          <Notice
            type="warning"
            description="Attention, le certificat Mobilic n'est en aucun cas gage de respect
        total de la réglementation par l'entreprise. Il n'atteste que de la
        bonne utilisation de l'outil de suivi du temps de travail."
            sx={{ marginTop: 3 }}
          />
          <Typography mt={2} className={classes.linkExplanation}>
            <Link
              href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Qu'est-ce que le certificat Mobilic ?
            </Link>
          </Typography>
        </Container>
        <Container maxWidth="xl" sx={{ textAlign: "center" }}>
          <Typography variant="h3" mt={8}>
            Consultez le statut de certification d'une entreprise :
          </Typography>
          <Grid container mt={2} mb={5} className={classes.searchBar}>
            <Grid item xs={12} md={10} margin="auto">
              <Input
                label=""
                required
                nativeInputProps={{
                  onChange: e => {
                    setSearchInput(e.target.value);
                  },
                  placeholder: "Rechercher un nom d'entreprise ou un SIREN"
                }}
                state={inputErrorMessage ? "error" : "default"}
                stateRelatedMessage={inputErrorMessage}
                addon={
                  <Button
                    iconId="fr-icon-search-line"
                    iconPosition="left"
                    onClick={() => onSearch()}
                  >
                    Rechercher
                  </Button>
                }
              />
            </Grid>
          </Grid>
        </Container>
        {searchResults?.length > 1 && (
          <Typography variant="h4">
            Certains établissements de l'entreprise sont certifiés.
          </Typography>
        )}
        {searchResults?.length === 1 && (
          <Typography variant="h4">L'entreprise est certifiée.</Typography>
        )}
        {searchResults?.length === 0 && searchDone && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" mt={3}>
              Nous n'avons pas trouvé de certification pour cette entreprise.
            </Typography>
            <Typography>
              Il est possible qu'elle ne soit pas utilisatrice de Mobilic,
              qu'elle ne soit pas certifiée ou qu'elle n'ait pas consenti à
              partager l'information.
            </Typography>
          </Box>
        )}
        {searchResults?.length > 0 && (
          <Box sx={{ textAlign: "center" }}>
            <CertificationImage className={classes.certificationImage} />
            <Table
              fixedHeader
              noCaption
              tableID="certificationTable"
              headers={["Nom", "SIREN", "SIRET", "Date de certification"]}
              data={searchResults.map(r => [
                r.company_name,
                r.siren,
                r.siret,
                r.certification_attribution_date
              ])}
              className={classes.resultTable}
            />
          </Box>
        )}
      </Main>
      <Footer />
    </>
  );
}
