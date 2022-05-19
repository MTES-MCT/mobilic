import React from "react";
import Dialog from "@mui/material/Dialog";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import TextField from "common/utils/TextField";
import Typography from "@mui/material/Typography";
import { EmailField } from "../common/EmailField";
import { useSnackbarAlerts } from "../common/Snackbar";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import { HTTP_QUERIES } from "common/utils/apiQueries";

const useStyles = makeStyles(theme => ({
  caption: {
    marginTop: theme.spacing(2),
    display: "block",
    color: theme.palette.grey[600]
  }
}));

const PROFILES = [
  {
    name: "employees",
    label: "Travailleur mobile"
  },
  {
    name: "admins",
    label: "Gestionnaire"
  },
  {
    name: "controllers",
    label: "Contrôleur"
  },
  {
    name: "softwares",
    label: "Editeur de logiciel"
  },
  {
    name: "others",
    label: "Autre"
  }
];

export default function NewsletterSubscriptionModal({ open, handleClose }) {
  const [profile, setProfile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const classes = useStyles();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      await api.jsonHttpQuery(HTTP_QUERIES.subscribeToNewsletter, {
        json: { list: profile === "others" ? "admins" : profile, email }
      });
      await alerts.success(
        "Abonnement à la lettre d'information réussie !",
        "subscribe-to-nl",
        6000
      );
    }, "subscribe-to-nl");
    setLoading(false);
    handleClose();
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <CustomDialogTitle
          handleClose={handleClose}
          title="Abonnement à la lettre d'information"
        />
        <DialogContent>
          <Typography>
            Veuillez renseigner votre adresse email pour vous abonner à notre
            lettre d'information
          </Typography>
          <EmailField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Email"
            value={email}
            setValue={setEmail}
            validate
            error={emailError}
            setError={setEmailError}
          />
          <TextField
            label="Profil"
            variant="standard"
            required
            fullWidth
            select
            value={profile}
            onChange={e => setProfile(e.target.value)}
          >
            {PROFILES.map(prof => (
              <MenuItem key={prof.name} value={prof.name}>
                {prof.label}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" className={classes.caption}>
            Vous pouvez vous désabonner à tout moment en cliquant sur le lien
            présent dans nos emails.
          </Typography>
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton
            aria-label="Abonnement"
            color="primary"
            type="submit"
            variant="contained"
            disabled={emailError || !email || !profile}
            loading={loading}
          >
            Abonnement
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
