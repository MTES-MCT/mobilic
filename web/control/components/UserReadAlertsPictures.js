import React from "react";
import { Stack, Typography } from "@mui/material";
import { useControl } from "../../controller/utils/contextControl";
import Picture from "../../controller/components/pictures/Picture";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  imageContainer: {
    maxWidth: "100%",
    height: "35vh",
    width: "inherit"
  }
}));

export const UserReadAlertsPictures = () => {
  const classes = useStyles();
  const { controlData } = useControl();
  return (
    <>
      <Typography fontWeight={700}>
        Photos du livret individuel de contrôle
      </Typography>
      <Stack rowGap={2} height="100%" mt={2}>
        {controlData.pictures.map((picture, index) => (
          <Picture
            key={`photo__${index}`}
            src={picture.url}
            classes={{
              root: classes.imageContainer
            }}
            icon={
              <Button
                iconId="fr-icon-zoom-in-line"
                onClick={() => console.log("click")}
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
