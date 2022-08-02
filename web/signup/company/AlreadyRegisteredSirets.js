import React from "react";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { InfoItem } from "../../home/InfoField";
import AlertEmailDelay from "../../common/AlertEmailDelay";
import ButtonGoHome from "../../common/ButtonGoHome";

const useStyles = makeStyles(theme => ({
  grid: {
    marginBottom: 0
  }
}));

const AlreadyRegisteredSirets = () => {
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const classes = useStyles();

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      className={classes.grid}
    >
      <Grid item xs={12}>
        <InfoItem
          name="Entreprise déjà inscrite"
          bold
          info={`L'entreprise est déjà inscrite. Un email de vérification de votre compte salarié vous a été envoyé à l'adresse ${userInfo.email}. Une fois votre compte validé, veuillez vous rapprocher de votre employeur afin d'être rattaché à votre entreprise.`}
        />
      </Grid>
      <Grid item xs={12}>
        <AlertEmailDelay />
      </Grid>
      <Grid item xs={12}>
        <ButtonGoHome />
      </Grid>
    </Grid>
  );
};

export default AlreadyRegisteredSirets;
