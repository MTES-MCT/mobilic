import React from "react";
import { Grid, Typography } from "@mui/material";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useControl } from "../../utils/contextControl";
import Picture from "./Picture";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  addPicturesButton: {
    marginBottom: theme.spacing(4)
  },
  image: {
    aspectRatio: "1 / 1",
    objectFit: "cover"
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
  const modals = useModals();

  const _onUpload = async () => {
    await uploadPictures(pictures);
    onClose();
  };

  return (
    <>
      <Typography variant="h2" component="h1" mb={2}>
        Confirmer la sélection
      </Typography>
      <Typography mb={4}>Cliquez sur les photos pour les agrandir.</Typography>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={1}
        component="ul"
        style={{ listStyleType: "none", padding: 0 }}
      >
        {pictures.map((picture, index) => (
          <Grid
            item
            xs={4}
            key={picture.url}
            component="li"
            sx={{ display: "flex", justifyContent: "center" }}
            onClick={() =>
              modals.open("controlPicture", {
                src: picture.url,
                title: `Photo ${index + 1}`
              })
            }
          >
            <Picture
              src={picture.url}
              alt={`Photo ${index + 1}`}
              width="100%"
              height="auto"
              className={{
                root: classes.image
              }}
              icon={
                <Button
                  className={classes.removeButton}
                  iconId="fr-icon-close-line"
                  onClick={e => {
                    e.stopPropagation();
                    removeImage(picture.url);
                  }}
                  title="Retirer l'image"
                />
              }
            />
          </Grid>
        ))}
      </Grid>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
      </div>
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
