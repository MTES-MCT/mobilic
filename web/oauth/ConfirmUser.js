import React from "react";
import Typography from "@mui/material/Typography";
import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Paper from "@mui/material/Paper";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { Section } from "../common/Section";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

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
