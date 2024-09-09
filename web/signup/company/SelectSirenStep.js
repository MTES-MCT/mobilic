import Box from "@mui/material/Box";
import { SirenInputField } from "./SirenInputField";
import { LoadingButton } from "common/components/LoadingButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "../../common/LinkButton";
import React from "react";
import { Step } from "./Step";
import { SIREN_QUERY } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { LegalUnitInfo } from "./LegalUnitInfo";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { MandatoryField } from "../../common/MandatoryField";

const useStyles = makeStyles(theme => ({
  button: {
    marginTop: theme.spacing(2)
  },
  noSirenText: {
    display: "block",
    fontStyle: "italic",
    paddingTop: theme.spacing(4)
  },
  sirenResultText: {
    marginTop: theme.spacing(4)
  },
  findSirenText: {
    display: "block",
    paddingTop: theme.spacing(4)
  }
}));

export function SelectSirenStep({
  siren,
  setSiren,
  sirenInfo,
  setSirenInfo,
  ...props
}) {
  const api = useApi();

  const [sirenFormatError, setSirenFormatError] = React.useState(false);
  const [hasValidatedSiren, setHasValidatedSiren] = React.useState(false);
  const [loadingSirenInfo, setLoadingSirenInfo] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  const classes = useStyles();

  function resetApiResponse() {
    setSirenInfo(null);
    setApiError("");
    setHasValidatedSiren(false);
  }

  const handleSirenSubmit = async e => {
    e.preventDefault();
    resetApiResponse();
    setLoadingSirenInfo(true);
    try {
      const sirenResponse = await api.graphQlQuery(
        SIREN_QUERY,
        {
          siren
        },
        { context: { nonPublicApi: true } }
      );
      setSirenInfo(sirenResponse.data.sirenInfo);
    } catch (err) {
      setApiError(formatApiError(err));
    }
    setLoadingSirenInfo(false);
  };

  const sirenAlreadyFullyRegistered =
    sirenInfo &&
    sirenInfo.registrationStatus &&
    sirenInfo.registrationStatus === "fully_registered";

  return (
    <Step
      reset={() => {
        resetApiResponse();
        setSiren("");
        setSirenFormatError("");
      }}
      complete={siren && !sirenFormatError && hasValidatedSiren}
      {...props}
    >
      <MandatoryField />
      <form
        className="vertical-form centered"
        autoComplete="off"
        onSubmit={handleSirenSubmit}
      >
        <Box
          className="flex-row-space-between"
          style={{ alignItems: "baseline" }}
        >
          <SirenInputField
            siren={siren}
            setSiren={value => {
              resetApiResponse();
              setSiren(value);
            }}
            error={sirenFormatError}
            setError={setSirenFormatError}
          />
          <LoadingButton
            aria-label="Rechercher SIREN"
            variant="contained"
            color="primary"
            type="submit"
            loading={loadingSirenInfo}
            disabled={!siren || sirenFormatError}
          >
            Rechercher
          </LoadingButton>
        </Box>
        {apiError || sirenAlreadyFullyRegistered ? (
          <Typography display="block" align="justify" color="error">
            {sirenAlreadyFullyRegistered
              ? "L'entreprise a déjà été inscrite. Rapprochez-vous de vos collaborateurs administrateurs pour y être rattaché(e)"
              : apiError}
          </Typography>
        ) : sirenInfo && sirenInfo.legalUnit ? (
          <>
            <Typography
              gutterBottom
              align="left"
              className={classes.sirenResultText}
            >
              1 unité légale trouvée
            </Typography>
            <LegalUnitInfo legalUnit={sirenInfo.legalUnit} />
          </>
        ) : null}
        {!sirenAlreadyFullyRegistered &&
          !hasValidatedSiren &&
          (apiError || sirenInfo) && (
            <Button
              variant={apiError ? "outlined" : "contained"}
              color={apiError ? "secondary" : "primary"}
              className={classes.button}
              onClick={() => {
                setApiError("");
                setHasValidatedSiren(true);
              }}
            >
              {apiError
                ? "Poursuivre sans vérification du SIREN"
                : "Poursuivre avec cette unité légale"}
            </Button>
          )}
        {(!siren || sirenFormatError) && (
          <>
            <Typography
              className={classes.findSirenText}
              align="left"
              variant="caption"
            >
              <Link
                href="https://annuaire-entreprises.data.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trouvez facilement le numéro SIREN de votre entreprise
              </Link>
            </Typography>
            <Typography
              className={classes.noSirenText}
              align="left"
              variant="caption"
            >
              Vous n'avez pas de numéro SIREN ?{" "}
              <Link href="mailto:assistance@mobilic.beta.gouv.fr">
                Ecrivez-nous.
              </Link>
            </Typography>
          </>
        )}
      </form>
    </Step>
  );
}
