import React from "react";
import { EditableMissionInfo } from "./EditableMissionInfo";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import { AddressField } from "../../common/AddressField";
import KilometerReadingField from "../../common/KilometerReadingField";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import LocationIcon from "@material-ui/icons/LocationOn";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles(theme => ({
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  }
}));

export function MissionLocationInfo({
  location,
  time,
  editLocation,
  editKm,
  defaultAddresses,
  minKmReading,
  maxKmReading,
  showKm
}) {
  const [kmError, setKmError] = React.useState(null);

  const classes = useStyles();

  return (
    <List>
      <ListItem disableGutters>
        <Tooltip title="Heure">
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
        </Tooltip>
        {time ? (
          <Typography>{time}</Typography>
        ) : (
          <Typography className={classes.warningText}>En cours</Typography>
        )}
      </ListItem>
      <ListItem disableGutters>
        <Tooltip title="Lieu">
          <ListItemIcon>
            <LocationIcon />
          </ListItemIcon>
        </Tooltip>
        <EditableMissionInfo
          fullWidth
          value={location}
          format={address =>
            address ? (
              <span>
                {formatAddressMainText(address)}{" "}
                <span>{formatAddressSubText(address)}</span>
              </span>
            ) : null
          }
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
          disabledEdit={location => !location}
        />
      </ListItem>
      {showKm && location && (
        <ListItem disableGutters>
          <Tooltip title="Relevé kilométrique du véhicule">
            <ListItemIcon>KM</ListItemIcon>
          </Tooltip>
          <EditableMissionInfo
            fullWidth
            value={location.kilometerReading}
            renderEditMode={(newKm, setNewKm) => (
              <KilometerReadingField
                kilometerReading={newKm}
                setKilometerReading={setNewKm}
                minKmReading={minKmReading}
                maxKmReading={maxKmReading}
                error={kmError}
                setError={setKmError}
                variant="outlined"
                size="small"
              />
            )}
            onEdit={editKm}
            disabledEdit={km => kmError}
          />
        </ListItem>
      )}
    </List>
  );
}
