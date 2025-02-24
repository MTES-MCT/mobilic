import React from "react";
import { Stack, Typography } from "@mui/material";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  imageContainer: {
    width: "105px",
    height: "105px",
    overflow: "hidden",
    position: "relative"
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  }
}));

export function ControlPicturesReview({ onClose, pictures }) {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h2" component="h1" mb={2}>
        Confirmer la sélection
      </Typography>
      <Typography mb={4}>
        Vous pouvez organiser les photos en les faisant glisser.
      </Typography>
      <Stack direction="row" flexWrap="wrap" mb={2}>
        {pictures.map((picture, index) => (
          <div key={`photo_${index}`} className={classes.imageContainer}>
            <img src={picture} className={classes.image} />
          </div>
        ))}
      </Stack>
      <ButtonsGroup
        buttons={[
          {
            onClick: () => console.log("todo"),
            children: `Ajouter ${pictures.length} photos au contrôle`
          },
          {
            children: "Annuler",
            priority: "secondary",
            onClick: onClose
          }
        ]}
      />
    </>
  );
}
