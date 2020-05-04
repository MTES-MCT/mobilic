import React from "react";
import Typography from "@material-ui/core/Typography";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import CardContent from "@material-ui/core/CardContent";
import Card from "@material-ui/core/Card/Card";
import {FunnelModal} from "./FunnelModal";
import useTheme from "@material-ui/core/styles/useTheme";

export function TeamOrSoloChoiceModal({ open, handleClose, handleContinue }) {
  const theme = useTheme();
  const cardWidth = 160;
  const cardStyle = {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  };
  const cardIconFontSize = 80;
  return (
    <FunnelModal
      open={open}
      handleBack={handleClose}
    >
      <Container className="flex-column-space-between" style={{flexGrow: 1}}>
        <Container style={{maxWidth: "400px"}} disableGutters>
          <Typography style={{marginTop: theme.spacing(2)}} variant="h5">Pour qui enregistrez-vous le temps de travail&nbsp;?</Typography>
          <Box mt={3} className="flex-row-center" >
            <Card
              style={{width: cardWidth, marginRight: theme.spacing(0.5)}}
              onClick={() => handleContinue(false)}
            >
              <CardContent className="flex-column-space-between" style={cardStyle}>
                <PersonIcon color="primary" style={{fontSize: cardIconFontSize}} />
                <Typography className="bold" color="primary">Moi</Typography>
              </CardContent>
            </Card>
            <Card
              style={{width: cardWidth, marginLeft: theme.spacing(0.5)}}
              onClick={() => handleContinue(true)}
            >
              <CardContent className="flex-column-space-between" style={cardStyle}>
                <PeopleIcon color="primary" style={{fontSize: cardIconFontSize}} />
                <Typography noWrap className="bold" color="primary">Moi et mon équipe</Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Container>
    </FunnelModal>
  );
}
