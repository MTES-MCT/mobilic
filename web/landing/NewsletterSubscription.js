import React from "react";
import Dialog from "@material-ui/core/Dialog";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "common/utils/TextField";
import Typography from "@material-ui/core/Typography";
import { EmailField } from "../common/EmailField";
import { useSnackbarAlerts } from "../common/Snackbar";
import { useApi } from "common/utils/api";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
      await api.httpQuery("POST", "/contacts/subscribe-to-newsletter", {
        json: { list: profile === "others" ? "admins" : profile, email }
      });
      await alerts.success(
        "Inscription à la Newsletter réussie !",
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
          title="Inscription à la newsletter"
        />
        <DialogContent>
          <Typography>
            Veuillez renseigner votre adresse email pour vous inscrire à notre
            newsletter
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
            Vous pouvez vous désinscrire à tout moment en cliquant sur le lien
            présent dans nos emails.
          </Typography>
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton
            aria-label="Inscription"
            color="primary"
            type="submit"
            variant="contained"
            disabled={emailError || !email || !profile}
            loading={loading}
          >
            Inscription
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
