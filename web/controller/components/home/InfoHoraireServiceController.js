import React from "react";
import { ControllerHelpCard } from "../home/ControllerHelpCard";
import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import Typography from "@mui/material/Typography";
import { MobilicQrCode } from "common/utils/icons";

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(4)
  },
  helpCard: {
    padding: theme.spacing(2)
  },
  presentMobilic: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(2)
  },
  qrCode: {
    textAlign: "center"
  }
}));

export function InfoHoraireServiceController() {
  const classes = useStyles();

  return [
    <Stack key={0} spacing={2} className={classes.content}>
      <Typography>
        Vérifiez que l'horaire de service présenté est recevable :
      </Typography>
      <div className={classes.helpCard}>
        <ControllerHelpCard
          iconName="fr-icon-question-fill"
          title="FAQ"
          description="Les horaires de service sont-ils recevables ?"
          linkTo="https://mobilic.gitbook.io/mobilic-faq-dediee-aux-corps-de-controle/#les-horaires-de-service-sont-ils-recevables"
        />
      </div>
      <p>
        Si l'horaire de service n'est pas recevable, vous pouvez constater une
        infraction directement dans Greco.
      </p>
    </Stack>,
    <Stack
      key={1}
      spacing={2}
      className={classNames(
        "fr-background-alt--blue-france",
        classes.presentMobilic
      )}
    >
      <div>
        <h6>
          Pour aller plus loin, vous pouvez diffuser la connaissance de Mobilic
        </h6>
        <p>Ce QR code permet au salarié de télécharger Mobilic</p>
        <div className={classes.qrCode}>
          <MobilicQrCode />
        </div>
      </div>
    </Stack>
  ];
}
