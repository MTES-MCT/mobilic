import TextField from "@mui/material/TextField";
import { CheckboxField } from "../../common/CheckboxField";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { makeStyles } from "@mui/styles";
import { Step } from "./Step";

const useStyles = makeStyles(theme => ({
  verticalFormButton: {
    marginTop: theme.spacing(4)
  }
}));

export function SubmitStep({
  handleSubmit,
  companyName,
  setCompanyName,
  loading,
  ...props
}) {
  const [claimedRights, setClaimedRights] = React.useState(false);

  const classes = useStyles();

  return (
    <Step reset={() => setCompanyName("")} complete={companyName} {...props}>
      <form
        className="vertical-form centered"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <TextField
          fullWidth
          variant="standard"
          required
          label="Nom usuel"
          value={companyName}
          onChange={e => setCompanyName(e.target.value.trimLeft())}
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
          disabled={!companyName || !claimedRights}
          loading={loading}
        >
          Terminer
        </LoadingButton>
      </form>
    </Step>
  );
}
