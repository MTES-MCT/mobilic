import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useApi } from "common/utils/api";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { LoadingButton } from "common/components/LoadingButton";
import {
  SETUP_TOTP_MUTATION,
  VERIFY_TOTP_MUTATION
} from "common/utils/apiQueries/userInfo";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { Section } from "../../common/Section";
import { OtpInput } from "../../common/OtpInput";

export function TotpSetup() {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const userInfo = store.userInfo();

  const [provisioningUri, setProvisioningUri] = React.useState(null);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  if (!userInfo.admin) {
    return null;
  }

  const handleSetup = async () => {
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const response = await api.graphQlMutate(
        SETUP_TOTP_MUTATION,
        {},
        { context: { nonPublicApi: true } }
      );
      setProvisioningUri(response.data.account.setupTotp.provisioningUri);
    }, "totp-setup");
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      await api.graphQlMutate(
        VERIFY_TOTP_MUTATION,
        { code: verificationCode },
        { context: { nonPublicApi: true } }
      );
      await store.setUserInfo({ ...store.userInfo(), totpEnabled: true });
      await broadCastChannel.postMessage("update");
      setProvisioningUri(null);
      setVerificationCode("");
    }, "totp-verify");
    setLoading(false);
  };

  if (userInfo.totpEnabled && !provisioningUri) {
    return (
      <Section title="Double authentification (2FA)" component="h2">
        <Alert
          severity="success"
          title="2FA activée"
          description="La double authentification est active sur votre compte."
          small
        />
        <Box sx={{ mt: 2 }}>
          <Button priority="tertiary" onClick={handleSetup}>
            Reconfigurer la 2FA
          </Button>
        </Box>
      </Section>
    );
  }

  if (provisioningUri) {
    return (
      <Section title="Double authentification (2FA)" component="h2">
        <Typography variant="body1" sx={{ mb: 2 }}>
          Scannez ce QR code avec votre application d'authentification
          (Google Authenticator, Authy, Bitwarden…), puis saisissez le code à 6 chiffres
          pour activer la 2FA.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <QRCodeCanvas value={provisioningUri} size={200} includeMargin />
        </Box>
        <form onSubmit={handleVerify}>
          <OtpInput
            label="Code de vérification"
            value={verificationCode}
            onChange={setVerificationCode}
            disabled={loading}
          />
          <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={verificationCode.length !== 6}
            >
              Activer la 2FA
            </LoadingButton>
            <Button
              priority="secondary"
              type="button"
              onClick={() => {
                setProvisioningUri(null);
                setVerificationCode("");
              }}
            >
              Annuler
            </Button>
          </Box>
        </form>
      </Section>
    );
  }

  return (
    <Section title="Double authentification (2FA)" component="h2">
      <Typography variant="body1" sx={{ mb: 2 }}>
        Renforcez la sécurité de votre compte administrateur en activant
        la double authentification (TOTP).
      </Typography>
      <LoadingButton loading={loading} onClick={handleSetup}>
        Configurer la 2FA
      </LoadingButton>
    </Section>
  );
}
