import React from "react";
import Typography from "@mui/material/Typography";
import { currentUserId } from "common/utils/cookie";
import Grid from "@mui/material/Grid";
import Notice from "../../common/Notice";
import { Section } from "../../common/Section";
import {
  Box,
  SwipeableDrawer
} from "@mui/material";
import UserControlDetail from "./controlSection/UserControlDetail";
import UserControlsList from "./controlSection/UserControlsList";

export function UserControlSection() {
  const [selectedControl, setSelectedControl] = React.useState(null);
  const [openControlDetail, setOpenControlDetail] = React.useState(false);

  const handleControlClick = control => {
    setSelectedControl(control);
    setOpenControlDetail(true);
  };

  return (
    <Section title="Mes contrôles en bord de route">
      <Grid container>
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          mb={2}
          gap={2}
        >
          <Typography variant="body2" color="textSecondary">
            Retrouvez vos précédents bulletins de contrôle qui vous ont été
            remis en version numérique. Un bulletin de contrôle peut servir
            de justificatif en cas de contrôle dans la période d'échéance.
          </Typography>
          <Notice
            description="Votre employeur est responsable en cas de contrôle en bord
              de route"
            size="small"
            type="warning"
          />
        </Box>

        <Grid item xs={12}>
          <UserControlsList 
            userId={currentUserId()} 
            onControlClick={handleControlClick} 
          />
        </Grid>
      </Grid>

      <SwipeableDrawer
        anchor="right"
        disableSwipeToOpen
        disableDiscovery
        open={openControlDetail}
        onClose={() => {
          setOpenControlDetail(false);
          setSelectedControl(null);
        }}
        PaperProps={{
          sx: {
            width: { xs: "100vw", md: 860 }
          }
        }}
      >
        {selectedControl && (
          <UserControlDetail
            control={selectedControl}
            onClose={() => {
              setOpenControlDetail(false);
              setSelectedControl(null);
            }}
          />
        )}
      </SwipeableDrawer>
    </Section>
  );
}