import { useApi } from "common/utils/api";
import { USER_CONTROLS_QUERY } from "common/utils/apiQueries";
import Stack from "@mui/material/Stack";
import React from "react";
import Typography from "@mui/material/Typography";
import { currentUserId } from "common/utils/cookie";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { formatDateTime } from "common/utils/time";
import Notice from "../../common/Notice";
import { Section } from "../../common/Section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  IconButton,
  SwipeableDrawer
} from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import UserControlDetail from "common/components/UserControlDetail";

export function UserControlSection() {
  const api = useApi();
  const [userControls, setUserControls] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedControl, setSelectedControl] = React.useState(null);
  const [openControlDetail, setOpenControlDetail] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const response = await api.graphQlQuery(USER_CONTROLS_QUERY, {
        userId: currentUserId()
      });
      setUserControls(response.data?.user?.userControls || []);

      setLoading(false);
    };
    loadData();
  }, []);

  const handleControlClick = control => {
    setSelectedControl(control);
    setOpenControlDetail(true);
  };

  return (
    <Section title="Mes contrôles en bord de route">
      <Grid container>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={200} />
        ) : (
          <>
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
                de justificatif en cas de contrôle dans la période d’échéance.
              </Typography>
              <Notice
                description="Votre employeur est responsable en cas de contrôle en bord
                  de route"
                size="small"
                type="warning"
              />
            </Box>

            {userControls.length > 0 && (
              <Grid item xs={12}>
                <Stack direction="column">
                  <Table
                    sx={{
                      marginTop: 2,
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid rgba(224, 224, 224, 1)"
                      },
                      "& .MuiTableHead-root .MuiTableCell-root": {
                        borderBottom: "2px solid rgba(224, 224, 224, 1)",
                        fontWeight: "bold"
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Lieu</TableCell>
                        <TableCell width={60}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userControls.map(control => (
                        <TableRow
                          key={control.id}
                          hover
                          onClick={() => handleControlClick(control)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover"
                            }
                          }}
                        >
                          <TableCell>
                            {formatDateTime(control.creationTime, {
                              withSeconds: false
                            })}
                          </TableCell>
                          <TableCell>
                            {control.controlBulletin?.locationLieu ||
                              "Non renseigné"}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <ChevronRight />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Stack>
              </Grid>
            )}

            {userControls.length === 0 && (
              <Grid item xs={12}>
                <Typography>
                  Vous n'avez pas de contrôle en bord de route enregistré dans
                  Mobilic.
                </Typography>
              </Grid>
            )}
          </>
        )}
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
