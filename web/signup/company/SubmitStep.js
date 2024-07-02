import { CheckboxField } from "../../common/CheckboxField";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { makeStyles } from "@mui/styles";
import { Step } from "./Step";
import { PhoneNumber } from "../../common/PhoneNumber";
import Stack from "@mui/material/Stack";
import { BusinessType } from "../../common/BusinessType";
import { Section } from "../../common/Section";
import { TextInput } from "@dataesr/react-dsfr";

const useStyles = makeStyles(theme => ({
  verticalFormButton: {
    marginTop: theme.spacing(4)
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
          <Stack direction="column" spacing={2} textAlign="left">
            <TextInput
              id="company-usual-name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value.trimLeft())}
              required
              {...(!companyName
                ? {
                    messageType: "error",
                    message:
                      "Veuillez renseigner un nom usuel pour l'entreprise"
                  }
                : {})}
              label="Nom usuel"
            />
            <PhoneNumber
              currentPhoneNumber={phoneNumber}
              setCurrentPhoneNumber={setPhoneNumber}
              label="Numéro de téléphone de l'entreprise"
            />
            <Section title="Veuillez indiquer votre type d'activité">
              <BusinessType
                onChangeBusinessType={setBusinessType}
                required
                forceColumn
                displayInfo
              />
            </Section>
          </Stack>
        )}
        <Section title="Attestation d'habilitation">
          <CheckboxField
            checked={claimedRights}
            onChange={() => setClaimedRights(!claimedRights)}
            label="J'atteste être habilité(e) à administrer l'entreprise"
            required
          />
        </Section>
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
