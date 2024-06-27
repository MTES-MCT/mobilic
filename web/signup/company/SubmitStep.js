import TextField from "@mui/material/TextField";
import { CheckboxField } from "../../common/CheckboxField";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { makeStyles } from "@mui/styles";
import { Step } from "./Step";
import { PhoneNumber } from "../../common/PhoneNumber";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { BusinessType } from "../../common/BusinessType";
import { Section } from "../../common/Section";
import { ExternalLink } from "../../common/ExternalLink";
import { Typography } from "@mui/material";

const useStyles = makeStyles(theme => ({
  verticalFormButton: {
    marginTop: theme.spacing(4)
  },
  greyText: {
    color: theme.palette.grey[600]
  }
}));

export function SubmitStep({
  handleSubmit,
  loading,
  companyName,
  setCompanyName,
  phoneNumber,
  setPhoneNumber,
  businessType,
  setBusinessType,
  ...props
}) {
  const [claimedRights, setClaimedRights] = React.useState(false);

  const classes = useStyles();

  const usingCompanyName = !!setCompanyName;

  return (
    <Step
      reset={usingCompanyName ? () => setCompanyName("") : () => {}}
      complete={!usingCompanyName || companyName}
      {...props}
    >
      <form
        className="vertical-form centered"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        {usingCompanyName && (
          <Stack direction="column" spacing={2}>
            <TextField
              fullWidth
              variant="standard"
              required={usingCompanyName}
              label="Nom usuel"
              value={companyName}
              onChange={e => setCompanyName(e.target.value.trimLeft())}
            />
            <PhoneNumber
              currentPhoneNumber={phoneNumber}
              setCurrentPhoneNumber={setPhoneNumber}
              label="Numéro de téléphone de l'entreprise"
            />
            <Section title="Veuillez indiquer votre type d'activité">
              <Box sx={{ textAlign: "left", marginBottom: 2 }}>
                <Typography className={classes.greyText}>
                  Par défaut, l’activité sera attribuée à tous vos salariés.
                  Vous aurez ensuite la possibilité de modifier le type
                  d'activité pour chaque salarié.
                </Typography>
                <ExternalLink
                  url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
                  text="À quoi sert cette information ?"
                  withIcon
                />
              </Box>
              <BusinessType
                onChangeBusinessType={setBusinessType}
                required
                forceColumn
              />
            </Section>
          </Stack>
        )}
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
          disabled={
            !claimedRights ||
            (usingCompanyName && !companyName) ||
            (usingCompanyName && !businessType)
          }
          loading={loading}
        >
          Terminer
        </LoadingButton>
      </form>
    </Step>
  );
}
