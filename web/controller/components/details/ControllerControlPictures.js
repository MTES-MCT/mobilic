import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Description } from "../../../common/typography/Description";
import { TitleContainer } from "../../../control/components/TitleContainer";
import { useControl } from "../../utils/contextControl";
import { makeStyles } from "@mui/styles";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { arrowButtonStyles } from "../utils/ArrowButton";
import { DAY } from "common/utils/time";
import Notice from "../../../common/Notice";

const useStyles = makeStyles(theme => ({
  imageContainer: {
    width: "100px",
    height: "100px",
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
  },
  tag: {
    color: fr.colors.decisions.background.flat.warning.default
  }
}));

export function ControllerControlPictures({ showPictures }) {
  const { controlData } = useControl();

  return (
    <Stack spacing={0} sx={{ width: "100%" }}>
      <TitleContainer>
        <Typography variant="h5" component="h2">
          Photos du LIC
        </Typography>
        <Button
          priority="primary"
          size="small"
          disabled={!controlData.canTakePictures}
          onClick={() => {
            console.log("click");
          }}
        >
          Prendre en photo
        </Button>
      </TitleContainer>
      <Content controlData={controlData} showPictures={showPictures} />
    </Stack>
  );
}

const Content = ({ controlData, showPictures }) => {
  const classes = useStyles();
  const arrowButtonClasses = arrowButtonStyles();

  const today = new Date();
  const expiryDate = new Date(controlData.picturesExpiryDate);
  const diffInDays = Math.floor((expiryDate - today) / DAY / 1000);

  const areThereAnyPictures =
    controlData.pictures && controlData.pictures.length > 0;

  if (diffInDays < 0) {
    return (
      <Notice description="Les photos ont été supprimées car elles ne sont conservées que 90 jours dans Mobilic." />
    );
  }

  return areThereAnyPictures ? (
    <Stack direction="column" rowGap={1}>
      <Stack direction="row" columnGap={2}>
        {controlData.pictures.slice(0, 3).map((picture, idx) => (
          <div
            key={`control_picture_${idx}`}
            className={classes.imageContainer}
          >
            <img className={classes.image} src={picture} alt="" />
          </div>
        ))}
      </Stack>
      <Tag className={classes.tag}>
        {`${diffInDays + 1} jour${diffInDays > 1 ? "s" : ""} avant la
suppression`}
      </Tag>
      <Button
        onClick={showPictures}
        priority="secondary"
        iconId="fr-icon-arrow-right-s-line"
        iconPosition="right"
        size="small"
        className={arrowButtonClasses.button}
      >
        {`Voir tout (${controlData.pictures.length} photo${
          controlData.pictures.length > 1 ? "s" : ""
        })`}
      </Button>
    </Stack>
  ) : (
    <Description noMargin>
      Ajoutez des photos du livret individuel de contrôle et retrouvez-les dans
      votre historique de contrôle afin de relever des infractions
    </Description>
  );
};
