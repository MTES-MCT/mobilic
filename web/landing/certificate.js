import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { Header } from "../common/Header";
import { Footer } from "./footer";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Grid from "@mui/material/Grid";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../common/Snackbar";
import { useApi } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";
import Box from "@mui/material/Box";
import { usePageTitle } from "../common/UsePageTitle";
import { Input } from "../common/forms/Input";
import Notice from "../common/Notice";
import { Main } from "../common/semantics/Main";
import { CertificationImage } from "../common/certification";
import { TextBadge } from "../common/hooks/useCompanyCertification";
import { Stack } from "@mui/material";
import { ExternalLink } from "../common/ExternalLink";

const useStyles = makeStyles(theme => ({
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
    marginBottom: theme.spacing(3),
    height: "150px"
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
        <Container maxWidth="lg">
          <Stack direction="column" textAlign="left" rowGap={4} mt={2}>
            <Typography component="h1" variant="h3" margin="auto">
              Les entreprises certifiées
            </Typography>
            <Typography>
              Le certificat, fourni par l'équipe Mobilic, atteste du fait qu'une
              entreprise se plie à la réglementation de suivi du temps de
              travail et, pour cela, utilise Mobilic de manière conforme.
              L'attestation est valable pour une durée de 6 mois.
            </Typography>
            <Notice
              type="warning"
              description="Attention, le certificat Mobilic n'est en aucun cas gage de respect
        total de la réglementation par l'entreprise. Il n'atteste que de la
        bonne utilisation de l'outil de suivi du temps de travail."
            />
            <ExternalLink
              url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
              text="Qu'est-ce que le certificat Mobilic ?"
            />
            <Typography variant="h4" margin="auto">
              Consultez le statut de certification d'une entreprise :
            </Typography>
            <Grid container className={classes.searchBar} mb={6}>
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
          </Stack>
          <Stack direction="column" rowGap={1}>
            {searchResults?.length === 1 && (
              <Typography variant="h4" margin="auto">
                L'entreprise est certifiée.
              </Typography>
            )}
            {searchResults?.length === 0 && searchDone && (
              <>
                <Typography variant="h4" margin="auto">
                  Nous n'avons pas trouvé de certification pour cette
                  entreprise.
                </Typography>
                <Typography>
                  Il est possible qu'elle ne soit pas utilisatrice de Mobilic,
                  qu'elle ne soit pas certifiée ou qu'elle n'ait pas consenti à
                  partager l'information.
                </Typography>
              </>
            )}
            {searchResults?.length > 0 && (
              <Box sx={{ textAlign: "center" }}>
                {searchResults?.length === 1 && (
                  <Box maxWidth="150px" margin="auto">
                    <CertificationImage
                      medal={searchResults[0].certification_level}
                      className={classes.certificationImage}
                      forcedSquare={true}
                    />
                  </Box>
                )}
                <Table
                  fixedHeader
                  fixed
                  noCaption
                  tableID="certificationTable"
                  headers={[
                    "Nom",
                    "SIREN",
                    "SIRET",
                    "Date de certification",
                    "Certification"
                  ]}
                  data={searchResults.map(r => [
                    r.company_name,
                    r.siren,
                    r.siret,
                    r.certification_attribution_date,
                    <TextBadge
                      medal={r.certification_level}
                      key={r.company_name}
                      displayIsCertified={true}
                    />
                  ])}
                />
              </Box>
            )}
          </Stack>
        </Container>
      </Main>
      <Footer />
    </>
  );
}
