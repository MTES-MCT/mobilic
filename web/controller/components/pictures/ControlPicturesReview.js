import React from "react";
import { Stack, Typography } from "@mui/material";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useControl } from "../../utils/contextControl";
import Picture from "./Picture";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 500
  },
  addPicturesButton: {
    marginBottom: theme.spacing(4)
  }
}));
export function ControlPicturesReview({
  onBack,
  onClose,
  pictures,
  removeImage
}) {
  const { uploadPictures } = useControl();
  const classes = useStyles();

  const _onUpload = async () => {
    await uploadPictures(pictures);
    onClose();
  };

  return (
    <>
      <Typography variant="h2" component="h1" mb={2}>
        Confirmer la sélection
      </Typography>
      <Typography mb={4}>
        Vous pouvez organiser les photos en les faisant glisser.
      </Typography>
      <Stack
        direction="row"
        flexWrap="wrap"
        mb={2}
        columnGap={2}
        rowGap={1}
        component="ul"
        style={{ listStyleType: "none", padding: 0 }}
      >
        {pictures.map((picture, index) => (
          <li key={`photo_${index}`}>
            <Picture
              src={picture.url}
              alt={`Photo ${index + 1}`}
              width="105px"
              height="105px"
              icon={
                <Button
                  className={classes.removeButton}
                  iconId="fr-icon-close-line"
                  onClick={() => removeImage(picture.url)}
                  title="Retirer l'image"
                />
              }
            />
          </li>
        ))}
      </Stack>
      <Button
        priority="tertiary"
        size="small"
        iconPosition="left"
        iconId="fr-icon-camera-fill"
        className={classes.addPicturesButton}
        onClick={onBack}
      >
        Ajouter des photos
      </Button>
      <ButtonsGroup
        buttons={[
          {
            onClick: _onUpload,
            children: `Ajouter ${pictures.length} photo${
              pictures.length > 1 ? "s" : ""
            } au contrôle`
          },
          {
            children: "Annuler",
            priority: "secondary",
            onClick: onBack
          }
        ]}
      />
    </>
  );
}
