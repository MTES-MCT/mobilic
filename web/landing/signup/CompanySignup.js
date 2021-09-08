import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { LoadingButton } from "common/components/LoadingButton";
import { formatApiError } from "common/utils/errors";
import { Section } from "../../common/Section";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { PaperContainerTitle } from "../../common/PaperContainer";
import SignupStepper from "./SignupStepper";
import { COMPANY_SIGNUP_MUTATION, SIREN_QUERY } from "common/utils/apiQueries";
import { Link } from "../../common/LinkButton";
import { CheckboxField } from "../../common/CheckboxField";

const useStyles = makeStyles(theme => ({
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
    fontStyle: "italic",
    fontSize: "80%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
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
  },
  noSirenText: {
    display: "block",
    fontStyle: "italic",
    paddingTop: theme.spacing(6)
  }
}));

export function CompanySignup() {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const [siren, setSiren] = React.useState("");
  const [usualName, setUsualName] = React.useState("");
  const [showUsualName, setShowUsualName] = React.useState(false);
  const [facilities, setFacilities] = React.useState(null);
  const [apiError, setApiError] = React.useState("");
  const [sirenError, setSirenError] = React.useState(false);
  const [claimedRights, setClaimedRights] = React.useState(false);

  const [
    shouldDisplaySignupProgress,
    setShouldDisplaySignupProgress
  ] = React.useState(false);

  const [loadingSirenInfo, setLoadingSirenInfo] = React.useState(false);
  const [loadingCompanySignup, setLoadingCompanySignup] = React.useState(false);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const isOnboarding = queryString.get("onboarding") === "true";
    if (isOnboarding) setShouldDisplaySignupProgress(true);
  }, [location]);

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
    setLoadingSirenInfo(true);
    setShowUsualName(false);
    setClaimedRights(false);
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
    await alerts.withApiErrorHandling(async () => {
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
      store.syncEntity([employment], "employments", () => false);
      store.batchUpdateStore();
      await broadCastChannel.postMessage("update");
      history.push(
        shouldDisplaySignupProgress
          ? "/signup/complete"
          : "/signup/company_complete",
        { companyName: employment.company.name }
      );
    }, "company-signup");
    setLoadingCompanySignup(false);
  };

  return (
    <Container
      style={{ paddingBottom: "16px" }}
      className="centered"
      maxWidth="sm"
    >
      {shouldDisplaySignupProgress && <SignupStepper activeStep={1} />}
      <PaperContainerTitle>Inscription de l'entreprise</PaperContainerTitle>
      <Section title="1. Quel est le SIREN de l'entreprise ?">
        <form
          className="vertical-form centered"
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
                sirenError ? "L'entrée n'est pas un numéro de SIREN valide" : ""
              }
              value={siren}
              onChange={e => {
                setApiError("");
                setFacilities(null);
                setShowUsualName(false);
                setClaimedRights(false);
                const newSirenValue = e.target.value.replace(/\s/g, "");
                setSiren(newSirenValue);
                setSirenError(!validateSiren(newSirenValue));
              }}
            />
            <LoadingButton
              aria-label="Rechercher SIREN"
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
            <Typography display="block" align="justify" color="error">
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
              aria-label="Continuer sans vérification du SIREN"
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
          {(!siren || sirenError) && (
            <Typography
              className={classes.noSirenText}
              align="left"
              variant="caption"
            >
              Vous n'avez pas de numéro SIREN ?{" "}
              <Link href="mailto:mobilic@beta.gouv.fr">Ecrivez-nous.</Link>
            </Typography>
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
                    className={facility.selected && classes.selectedFacility}
                  >
                    <Box p={2}>
                      <Typography variant="h5" className={classes.facilityName}>
                        {facility.company_name}
                        {facility.name ? ` - ${facility.name}` : ""}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={classes.facilitySiret}
                      >
                        SIRET : {facility.siret}
                      </Typography>
                      <Typography
                        variant="body2"
                        className={classes.facilitySiret}
                      >
                        Code NAF : {facility.activity}
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
            aria-label="Continuer"
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
            <CheckboxField
              checked={claimedRights}
              onChange={() => setClaimedRights(!claimedRights)}
              label="J'atteste être habilité(e) à administrer l'entreprise"
              required
            />
            <LoadingButton
              aria-label="Terminer inscription"
              className={classes.verticalFormButton}
              variant="contained"
              color="primary"
              type="submit"
              disabled={!siren || !usualName || !claimedRights}
              loading={loadingCompanySignup}
            >
              Terminer
            </LoadingButton>
          </form>
        </Section>
      )}
    </Container>
  );
}
