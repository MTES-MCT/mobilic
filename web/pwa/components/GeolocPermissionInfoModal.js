import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import { makeStyles } from "@mui/styles";
import GeolocModalBackground from "common/assets/images/geoloc-modal-background.svg";
import { Dialog } from "@mui/material";
import Slide from "@mui/material/Slide";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { DISMISSABLE_WARNINGS } from "../../admin/utils/dismissableWarnings";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { captureSentryException } from "common/utils/sentry";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Emoji from "../../common/Emoji";
import Notice from "../../common/Notice";

export default function GeolocPermissionInfoModal({
  open,
  handleClose,
  askCurrentPosition
}) {
  const useStyles = makeStyles(theme => ({
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: 0,
      background: `url(${GeolocModalBackground})`,
      backgroundColor: theme.palette.primary.main,
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      position: "relative",
      backgroundPositionY: "30%"
    },
    closeButton: {
      padding: theme.spacing(2),
      color: theme.palette.primary.contrastText,
      marginLeft: "auto"
    },
    sharePositionText: {
      color: theme.palette.primary.contrastText
    },
    facilitateText: {
      color: theme.palette.primary.contrastText,
      fontWeight: "bold"
    },
    locationExplanation: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      marginTop: theme.spacing(4),
      paddingRight: theme.spacing(3),
      paddingLeft: theme.spacing(3)
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(5),
      display: "flex",
      flexDirection: "column",
      flexShrink: "0"
    },
    ctaButton: {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.background.default
      },
      marginTop: theme.spacing(2)
    },
    subButton: {
      color: theme.palette.primary.contrastText
    }
  }));

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  const classes = useStyles();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();

  async function disableWarning() {
    try {
      await store.setUserInfo({
        ...store.userInfo(),
        disabledWarnings: store
          .userInfo()
          .disabledWarnings.concat([
            DISMISSABLE_WARNINGS.EMPLOYEE_GEOLOCATION_INFORMATION
          ])
      });
      api.graphQlMutate(
        DISABLE_WARNING_MUTATION,
        { warningName: DISMISSABLE_WARNINGS.EMPLOYEE_GEOLOCATION_INFORMATION },
        { context: { nonPublicApi: true } }
      );
    } catch (err) {
      captureSentryException(err);
    }
  }

  const dismissModal = async () => {
    await disableWarning();
    handleClose();
  };

  const acceptGeoLocation = async () => {
    await disableWarning();
    askCurrentPosition();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={dismissModal}
      TransitionComponent={Transition}
      PaperProps={{ className: `scrollable` }}
      fullScreen
    >
      <Container
        maxWidth="sm"
        className={classes.container}
        disableGutters
        data-testid="geoloc-modal-container"
      >
        <IconButton
          aria-label="Fermer"
          className={classes.closeButton}
          onClick={dismissModal}
        >
          <CloseIcon />
        </IconButton>
        <Box className={classes.locationExplanation}>
          <Typography className={classes.sharePositionText}>
            <Emoji emoji="👋" ariaLabel="Bonjour" /> Partagez votre position
            géographique
          </Typography>
          <Typography className={`${classes.facilitateText} bold`}>
            afin de faciliter la saisie de votre lieu de prise et de fin de
            service !
          </Typography>
        </Box>
        <Notice
          description="Rassurez-vous, vos trajets ne seront pas géolocalisés et votre
            accord sera toujours demandé !"
          size="small"
          sx={{ margin: 3, marginTop: "auto" }}
          data-testid="geoloc-modal-alert-info"
        />
        <Box
          className={classes.actionButton}
          data-testid="geoloc-modal-action-button"
        >
          <LoadingButton
            className={classes.ctaButton}
            onClick={acceptGeoLocation}
          >
            Partager ma position
          </LoadingButton>
          <LoadingButton
            style={{ marginTop: 8 }}
            className={classes.subButton}
            onClick={dismissModal}
          >
            Ignorer
          </LoadingButton>
        </Box>
      </Container>
    </Dialog>
  );
}
