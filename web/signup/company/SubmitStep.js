import TextField from "@mui/material/TextField";
import { CheckboxField } from "../../common/CheckboxField";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { makeStyles } from "@mui/styles";
import { Step } from "./Step";
import { PhoneNumber } from "../../common/PhoneNumber";
import { Stack } from "@mui/material";
import { BusinessType } from "../../common/BusinessType";

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
            <BusinessType onChangeBusinessType={setBusinessType} required />
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
