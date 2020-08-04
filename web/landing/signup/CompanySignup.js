import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
import { COMPANY_SIGNUP_MUTATION, SIREN_QUERY, useApi } from "common/utils/api";
import { useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import SignupStepper from "./SignupStepper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { LoadingButton } from "common/components/LoadingButton";
import { formatApiError } from "common/utils/errors";
import { Section } from "../../common/Section";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center"
  },
  formFieldTitle: {
    marginBottom: theme.spacing(1),
    textAlign: "left",
    fontWeight: "bold"
  },
  facilityName: {
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  facilitySiret: {
    fontStyle: "italic"
  },
  facilityPostalCode: {
    fontWeight: "normal"
  },
  warningButton: {
    marginTop: theme.spacing(2)
  },
  selectedFacility: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  verticalFormButton: {
    marginTop: theme.spacing(4)
  }
}));

export function CompanySignup() {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();

  const [siren, setSiren] = React.useState("");
  const [usualName, setUsualName] = React.useState("");
  const [showUsualName, setShowUsualName] = React.useState(false);
  const [facilities, setFacilities] = React.useState(null);
  const [apiError, setApiError] = React.useState("");
  const [sirenError, setSirenError] = React.useState(false);

  const [signupError, setSignupError] = React.useState("");

  const [loadingSirenInfo, setLoadingSirenInfo] = React.useState(false);
  const [loadingCompanySignup, setLoadingCompanySignup] = React.useState(false);

  const validateSiren = string => {
    if (!string) return true;
    if (string.length !== 9) return false;
    if (!/^\d+$/.test(string)) return false;

    // The last digit of the 9-digit siren must be the Luhn checksum of the 8 firsts
    // The following implementation is inspired from https://simplycalc.com/luhn-source.php

    let luhnSum = 0;
    for (let i = 8; i >= 0; i--) {
      let digit = parseInt(string.charAt(i));
      if (i % 2 === 1) {
        digit *= 2;
      }
      if (digit > 9) {
        digit -= 9;
      }
      luhnSum += digit;
    }
    return luhnSum % 10 === 0;
  };

  const handleSirenSubmit = async e => {
    e.preventDefault();
    setApiError("");
    setFacilities(null);
    setSignupError("");
    setLoadingSirenInfo(true);
    setShowUsualName(false);
    try {
      const sirenResponse = await api.graphQlQuery(
        SIREN_QUERY,
        {
          siren
        },
        { context: { nonPublicApi: true } }
      );
      const facilitiesInfo = sirenResponse.data.sirenInfo;
      if (facilitiesInfo.length === 0)
        setApiError("Aucun établissement n'a été trouvé pour ce SIREN");
      else setFacilities(facilitiesInfo);
    } catch (err) {
      setApiError(formatApiError(err));
    }
    setLoadingSirenInfo(false);
  };

  const handleCompanySignup = async e => {
    e.preventDefault();
    setLoadingCompanySignup(true);
    try {
      const payload = {
        siren: parseInt(siren),
        usualName: usualName.trim(),
        sirets: []
      };
      if (facilities && facilities.some(f => f.selected)) {
        payload.sirets = facilities.filter(f => f.selected).map(f => f.siret);
      }
      const apiResponse = await api.graphQlMutate(
        COMPANY_SIGNUP_MUTATION,
        payload,
        { context: { nonPublicApi: true } }
      );
      const employment = apiResponse.data.signUp.company.employment;
      await store.syncEntity([employment], "employments", () => false);
      history.push("/signup/complete");
    } catch (err) {
      setSignupError(formatApiError(err));
    }
    setLoadingCompanySignup(false);
  };

  return (
    <>
      <Paper key={0}>
        <SignupStepper activeStep={1} />
      </Paper>
      <Paper key={1}>
        <Container
          style={{ paddingBottom: "16px" }}
          className="centered"
          maxWidth="sm"
        >
          <Typography className={classes.title} variant="h3">
            Inscription de l'entreprise
          </Typography>
          <Section title="1. Quel est le SIREN de l'entreprise ?">
            <form
              className="vertical-form centered"
              noValidate
              autoComplete="off"
              onSubmit={handleSirenSubmit}
            >
              <Box
                className="flex-row-space-between"
                style={{ alignItems: "baseline" }}
              >
                <TextField
                  error={sirenError}
                  required
                  className="vertical-form-text-input"
                  label="SIREN"
                  placeholder="123456789"
                  helperText={
                    sirenError
                      ? "L'entrée n'est pas un numéro de SIREN valide"
                      : ""
                  }
                  value={siren}
                  onChange={e => {
                    setApiError("");
                    setSignupError("");
                    setFacilities(null);
                    setShowUsualName(false);
                    const newSirenValue = e.target.value.replace(/\s/g, "");
                    setSiren(newSirenValue);
                    setSirenError(!validateSiren(newSirenValue));
                  }}
                />
                <LoadingButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  loading={loadingSirenInfo}
                  disabled={!siren || sirenError}
                >
                  Rechercher
                </LoadingButton>
              </Box>
              {apiError && (
                <Typography display="block" align="left" color="error">
                  {apiError}
                </Typography>
              )}
              {facilities && (
                <Typography
                  display="block"
                  align="left"
                  variant="caption"
                  style={{ fontStyle: "italic" }}
                >
                  {facilities.length === 1
                    ? "1 établissement a été trouvé"
                    : `${facilities.length} établissements ont été trouvés`}
                </Typography>
              )}
              {apiError && (
                <Button
                  className={classes.warningButton}
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setApiError("");
                    setShowUsualName(true);
                  }}
                >
                  Continuer sans vérification du SIREN
                </Button>
              )}
            </form>
          </Section>
          {facilities && (
            <Section title="2. Veuillez sélectionner un ou plusieurs établissements">
              <Grid container spacing={3} wrap="wrap">
                {facilities.map((facility, index) => (
                  <Grid item key={index}>
                    <Button
                      onClick={() => {
                        const newFacilities = [...facilities];
                        newFacilities.splice(index, 1, {
                          ...facility,
                          selected: !facility.selected
                        });
                        setFacilities(newFacilities);
                      }}
                    >
                      <Card
                        raised
                        style={{ textAlign: "left" }}
                        className={
                          facility.selected && classes.selectedFacility
                        }
                      >
                        <Box p={2}>
                          <Typography
                            variant="h6"
                            className={classes.facilityName}
                          >
                            {facility.company_name}
                            {facility.name ? ` - ${facility.name}` : ""}
                          </Typography>
                          <Typography
                            variant="caption"
                            className={classes.facilitySiret}
                          >
                            SIRET : {facility.siret}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={classes.facilityPostalCode}
                          >
                            {facility.postal_code}
                          </Typography>
                        </Box>
                      </Card>
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Button
                className={classes.verticalFormButton}
                variant="contained"
                color="primary"
                disabled={!facilities.some(f => f.selected)}
                onClick={() => {
                  setUsualName(facilities[0].company_name);
                  setShowUsualName(true);
                }}
              >
                Continuer
              </Button>
            </Section>
          )}
          {showUsualName && (
            <Section
              title={
                facilities
                  ? "3. Souhaitez-vous changer le nom usuel de l'entreprise ?"
                  : "2. Quel est le nom de l'entreprise ?"
              }
            >
              <form
                className="vertical-form centered"
                noValidate
                autoComplete="off"
                onSubmit={handleCompanySignup}
              >
                <TextField
                  fullWidth
                  className="vertical-form-text-input"
                  required
                  label="Nom usuel"
                  value={usualName}
                  onChange={e => setUsualName(e.target.value.trimLeft())}
                />
                <LoadingButton
                  className={classes.verticalFormButton}
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!siren || !usualName}
                  loading={loadingCompanySignup}
                >
                  Terminer
                </LoadingButton>
                {signupError && (
                  <Typography color="error">{signupError}</Typography>
                )}
              </form>
            </Section>
          )}
        </Container>
      </Paper>
    </>
  );
}
