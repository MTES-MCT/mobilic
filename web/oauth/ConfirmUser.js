import React from "react";
import Typography from "@material-ui/core/Typography";
import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Paper from "@material-ui/core/Paper";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { Section } from "../common/Section";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center"
  },
  list: {
    paddingBottom: theme.spacing(6)
  }
}));

export function ConfirmUser({ clientName, redirectUri }) {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const consentUrl =
    "/oauth/authorize/consent" +
    (location.search ? location.search + "&" : "?") +
    `client_name=${clientName}`;

  return (
    <Paper key={1}>
      <Container className="centered" maxWidth="xs">
        <Typography className={classes.title} variant="h3">
          Choisir un compte
        </Typography>
        <Section last>
          <List className={classes.list}>
            <ListItem
              button
              aria-label="Choisir ce compte"
              onClick={() => history.push(consentUrl)}
            >
              <ListItemIcon>
                <AccountCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={userInfo.email} />
            </ListItem>
            <Divider component="li" />
            <ListItem
              button
              aria-label="Choisir un autre compte"
              onClick={async () => {
                await api.logout({
                  postFCLogoutRedirect: `/logout?next=${encodeURIComponent(
                    "/login?next=" + encodeURIComponent(consentUrl)
                  )}`
                });
                history.push(`/login?next=${encodeURIComponent(consentUrl)}`, {
                  clientName,
                  redirectUri
                });
              }}
            >
              <ListItemIcon>
                <AccountCircleOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Choisir un autre compte" />
            </ListItem>
          </List>
        </Section>
      </Container>
    </Paper>
  );
}
