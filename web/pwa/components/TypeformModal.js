import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import { Dialog } from "@mui/material";
import { useApi } from "common/utils/api";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { captureSentryException } from "common/utils/sentry";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { Widget } from "@typeform/embed-react";
import { CREATE_SURVEY_ACTION } from "common/utils/apiQueries";
import { SURVEY_ACTIONS } from "common/utils/surveys";

export default function TypeformModal({
  open,
  handleClose,
  typeformId,
  userId
}) {
  const useStyles = makeStyles(theme => ({
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: 0,
      position: "relative"
    },
    closeButton: {
      padding: theme.spacing(2),
      color: theme.palette.primary,
      marginLeft: "auto"
    }
  }));

  const classes = useStyles();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();

  async function sendActionForSurvey(action) {
    try {
      const apiResponse = await api.graphQlMutate(
        CREATE_SURVEY_ACTION,
        {
          userId: userId,
          surveyId: typeformId,
          action: action
        },
        { context: { nonPublicApi: true } }
      );
      await store.setUserInfo({
        ...store.userInfo(),
        surveyActions: apiResponse.data.createSurveyAction
      });
    } catch (err) {
      captureSentryException(err);
    }
  }

  React.useEffect(() => {
    if (open) {
      const loadData = async () => {
        await sendActionForSurvey(SURVEY_ACTIONS.DISPLAY);
      };
      loadData();
    }
  }, [open]);

  const dismissModal = async () => {
    await sendActionForSurvey(SURVEY_ACTIONS.CLOSE);
    handleClose();
  };

  const onSubmitForm = async () => {
    await sendActionForSurvey(SURVEY_ACTIONS.SUBMIT);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={dismissModal} fullScreen>
      <Container
        maxWidth="sm"
        className={classes.container}
        disableGutters
        data-testid="typeform-modal-container"
      >
        <IconButton
          aria-label="Fermer"
          className={classes.closeButton}
          onClick={dismissModal}
        >
          <CloseIcon />
        </IconButton>
        <Widget
          id={typeformId}
          displayAsFullScreenModal={false}
          enableSandbox={process.env.REACT_APP_SUBMIT_TYPEFORM !== "1"}
          style={{ height: "100%" }}
          onSubmit={() => onSubmitForm()}
        />
      </Container>
    </Dialog>
  );
}
