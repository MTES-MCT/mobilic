import React from "react";
import { Collapse, ListItemIcon, ListItemText } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Link } from "../../../common/LinkButton";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../utils/dismissableWarnings";
import { useWarningModificationMissionStyles } from "./WarningModificationMissionStyle";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { useApi } from "common/utils/api";
import Emoji from "../../../common/Emoji";
import Notice from "../../../common/Notice";

export function WarningModificationMission() {
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const classes = useWarningModificationMissionStyles();
  const api = useApi();

  const [modificationAlertOpen, setModificationAlertOpen] = React.useState(
    !userInfo.disabledWarnings ||
      !userInfo.disabledWarnings.includes(
        DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION
      )
  );

  async function handleDismissWarning() {
    try {
      await api.graphQlMutate(
        DISABLE_WARNING_MUTATION,
        { warningName: DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION },
        { context: { nonPublicApi: true } }
      );
      await store.setUserInfo({
        ...store.userInfo(),
        disabledWarnings: userInfo.disabledWarnings.concat([
          DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION
        ])
      });
      setModificationAlertOpen(false);
    } catch (err) {
      captureSentryException(err);
    }
  }

  return (
    <Collapse in={modificationAlertOpen}>
      <Notice
        className={classes.modificationAlert}
        data-testid="warningAlert"
        description={
          <>
            <List disablePadding>
              <ListItem
                disableGutters
                dense
                className={classes.modificationWarningItem}
              >
                <ListItemIcon className={classes.validationWarningIcon}>
                  <Emoji emoji="👉" ariaLabel="Information" />
                </ListItemIcon>
                <ListItemText primary="Les modifications sont enregistrées et apparaîtront en cas de contrôle." />
              </ListItem>
              <ListItem
                disableGutters
                dense
                className={classes.modificationWarningItem}
              >
                <ListItemIcon className={classes.validationWarningIcon}>
                  <Emoji emoji="👉" ariaLabel="Information" />
                </ListItemIcon>
                <ListItemText primary="En cas de modification des saisies, le salarié recevra une notification." />
              </ListItem>
            </List>
            <Link
              className={classes.dismissModificationAlert}
              to="/#"
              data-testid="dismissMissionModificationWarningLink"
              onClick={e => {
                e.preventDefault();
                handleDismissWarning();
              }}
            >
              Ne plus afficher ce message
            </Link>
          </>
        }
      />
    </Collapse>
  );
}
