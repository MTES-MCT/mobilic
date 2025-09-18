import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";
import { renderBadge } from "../../../common/certification";
import { Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { ExternalLink } from "../../../common/ExternalLink";

const CERTIFICATE_LEVELS = {
  BRONZE: { label: "Bronze" },
  SILVER: { label: "Argent" },
  GOLD: { label: "Or" },
  DIAMOND: { label: "Diamant" }
};

const useStyles = makeStyles(theme => ({
  text: {
    color: fr.colors.decisions.background.flat.grey.default
  },
  container: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    borderBottom: "1px solid #DDDDDD"
  }
}));

export default function CertificateFriseBadges({
  companyWithInfo,
  onDownloadCertificate = null
}) {
  const classes = useStyles();
  const { medal, frenchMedalLabel, isCertified } = useCompanyCertification(
    companyWithInfo.currentCompanyCertification
  );

  return (
    <Stack direction="column" className={classes.container} rowGap={3}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
      >
        <Stack direction="column">
          <Typography variant="h3" component="h1">
            Certificat
          </Typography>
          <Typography className={classes.text}>
            {isCertified ? (
              <>
                {companyWithInfo?.name || "Votre entreprise"} est certifiée{" "}
                <b>{frenchMedalLabel}</b> sur Mobilic !
              </>
            ) : (
              <>
                Votre entreprise {companyWithInfo?.name || ""} n'est{" "}
                <b>pas encore certifiée</b>.
              </>
            )}
          </Typography>
        </Stack>
        <Button
          priority="secondary"
          size="small"
          onClick={isCertified ? onDownloadCertificate : undefined}
          disabled={!isCertified}
        >
          Afficher le certificat sur mon site internet
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1}>
        {Object.keys(CERTIFICATE_LEVELS).map(m => renderBadge(m, medal === m))}
      </Stack>
      <ExternalLink
        url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
        text="Qu'est-ce que le certificat Mobilic ?"
        withIcon
      />
    </Stack>
  );
}
