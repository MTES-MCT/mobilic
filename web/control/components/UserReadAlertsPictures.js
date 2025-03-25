import React from "react";
import { Stack, Typography } from "@mui/material";
import { useControl } from "../../controller/utils/contextControl";
import Picture from "../../controller/components/pictures/Picture";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  imageContainer: {
    maxWidth: "100%",
    height: "35vh",
    width: "inherit"
  }
}));

export const UserReadAlertsPictures = () => {
  const classes = useStyles();
  const modals = useModals();

  const { controlData } = useControl();
  return (
    <>
      <Typography fontWeight={700}>
        Photos du livret individuel de contrôle
      </Typography>
      <Stack rowGap={2} height="100%" mt={2}>
        {controlData.pictures.map((picture, index) => (
          <Picture
            key={picture.url}
            src={picture.url}
            classes={{
              root: classes.imageContainer
            }}
            icon={
              <Button
                style={{ margin: "auto" }}
                iconId="fr-icon-zoom-in-line"
                onClick={() =>
                  modals.open("controlPicture", {
                    src: picture.url,
                    title: `Photo ${index + 1}`
                  })
                }
              >
                agrandir
              </Button>
            }
          />
        ))}
      </Stack>
    </>
  );
};
