import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { useAdminStore } from "../../store/store";
import { MissionVehicleInfo } from "../MissionVehicleInfo";
import { EditableMissionInfo } from "../EditableMissionInfo";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import { AddressField } from "../../../common/AddressField";
import KilometerReadingField from "../../../common/KilometerReadingField";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { OdometerIcon } from "common/utils/icons";

const grey = fr.colors.decisions.text.default.grey.default;

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: theme.spacing(2)
  },
  title: {
    fontWeight: 700,
    marginBottom: theme.spacing(2)
  },
  row: {
    display: "flex",
    alignItems: "center",
    minHeight: 32,
    gap: theme.spacing(2),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5)
  },
  label: {
    minWidth: 120,
    fontSize: 16,
    fontWeight: 500,
    color: fr.colors.decisions.text.title.grey.default,
    flexShrink: 0
  },
  valueGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexGrow: 1,
    "& .MuiGrid-root > .MuiGrid-item:first-child": {
      paddingLeft: "14px !important"
    },
    "& .MuiGrid-root > .MuiGrid-item + .MuiGrid-item": {
      paddingLeft: "0px !important"
    }
  },
  icon: {
    color: grey,
    fontSize: "18px !important",
    flexShrink: 0
  },
  dsfrIcon: {
    color: grey,
    flexShrink: 0
  },
  kmGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: theme.spacing(2),
    "& .MuiGrid-root > .MuiGrid-item:first-child": {
      paddingLeft: "14px !important"
    },
    "& .MuiGrid-root > .MuiGrid-item + .MuiGrid-item": {
      paddingLeft: "0px !important"
    },
    flexShrink: 0
  }
}));

function LocationRow({
  label,
  location,
  editLocation,
  editKm,
  showKm,
  kmReading,
  minKmReading,
  maxKmReading,
  defaultAddresses,
  classes
}) {
  const [kmError, setKmError] = React.useState(null);

  const formatAddress = address =>
    address ? (
      <span>
        {formatAddressMainText(address)} {formatAddressSubText(address)}
      </span>
    ) : null;

  const formatKm = km =>
    km != null ? `${km.toLocaleString("fr-FR")} km` : null;

  return (
    <Box className={classes.row}>
      <span className={classes.label}>{label}</span>
      <Box className={classes.valueGroup}>
        <span className={`fr-icon--sm fr-icon-map-pin-2-line ${classes.dsfrIcon}`} aria-hidden="true" />
        <EditableMissionInfo
          fullWidth
          value={location}
          format={formatAddress}
          renderEditMode={(newAddress, setNewAddress) => (
            <AddressField
              value={newAddress}
              defaultAddresses={defaultAddresses}
              variant="outlined"
              label="Lieu"
              small
              onChange={setNewAddress}
            />
          )}
          onEdit={editLocation}
          disabledEdit={loc => !loc}
        />
      </Box>
      {showKm && location && kmReading != null && (
        <Box className={classes.kmGroup}>
          <OdometerIcon className={classes.icon} aria-hidden="true" />
          <EditableMissionInfo
            value={kmReading}
            format={formatKm}
            renderEditMode={(newKm, setNewKm) => (
              <KilometerReadingField
                kilometerReading={newKm}
                setKilometerReading={setNewKm}
                minReading={minKmReading}
                maxReading={maxKmReading}
                error={kmError}
                setError={setKmError}
                variant="outlined"
                size="small"
              />
            )}
            onEdit={editKm}
            disabledEdit={() => !!kmError}
          />
        </Box>
      )}
    </Box>
  );
}

export function MissionDetailsVehicleAndLocations({
  mission,
  missionActions,
  isEditable,
  showKilometerReading,
  titleProps = {}
}) {
  const classes = useStyles();
  const adminStore = useAdminStore();

  const vehicles = React.useMemo(
    () =>
      adminStore.vehicles.filter(
        v => mission?.companyId && v.companyId === mission.companyId
      ),
    [mission, adminStore]
  );

  const missionCompany = adminStore.companies.find(
    c => c.id === mission?.companyId
  );
  const defaultAddresses = adminStore.knownAddresses.filter(
    a => missionCompany && a.companyId === missionCompany.id
  );

  if (mission.isHoliday) return null;

  return (
    <Box className={classes.container}>
      <Typography variant="h5" {...titleProps} className={classes.title}>
        Lieux et véhicules
      </Typography>

      <Box className={classes.row}>
        <span className={classes.label}>Véhicule</span>
        <Box className={classes.valueGroup}>
          <DirectionsCarOutlinedIcon className={classes.icon} aria-hidden="true" />
          <MissionVehicleInfo
            vehicle={mission.vehicle}
            editVehicle={isEditable ? missionActions.updateVehicle : null}
            vehicles={vehicles}
          />
        </Box>
      </Box>

      <LocationRow
        label="Prise de service"
        location={mission.startLocation}
        editLocation={
          isEditable
            ? address => missionActions.updateLocation(address, true, mission.startLocation?.kilometerReading)
            : null
        }
        editKm={isEditable ? km => missionActions.updateKilometerReading(km, true) : null}
        showKm={showKilometerReading}
        kmReading={mission.startLocation?.kilometerReading}
        maxKmReading={mission.endLocation?.kilometerReading}
        defaultAddresses={defaultAddresses}
        classes={classes}
      />

      <LocationRow
        label="Fin de service"
        location={mission.endLocation}
        editLocation={
          isEditable
            ? address => missionActions.updateLocation(address, false, mission.endLocation?.kilometerReading)
            : null
        }
        editKm={isEditable ? km => missionActions.updateKilometerReading(km, false) : null}
        showKm={showKilometerReading}
        kmReading={mission.endLocation?.kilometerReading}
        minKmReading={mission.startLocation?.kilometerReading}
        defaultAddresses={defaultAddresses}
        classes={classes}
      />
    </Box>
  );
}
