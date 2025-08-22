import React from "react";
import { EditableMissionInfo } from "./EditableMissionInfo";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import { AddressField } from "../../common/AddressField";
import KilometerReadingField from "../../common/KilometerReadingField";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationIcon from "@mui/icons-material/LocationOn";
import Tooltip from "@mui/material/Tooltip";

export function MissionLocationInfo({
  location,
  time,
  editLocation,
  editKm,
  defaultAddresses,
  minKmReading,
  maxKmReading,
  showKm,
  showLocation
}) {
  const [kmError, setKmError] = React.useState(null);

  return (
    <List>
      <ListItem disableGutters>
        <Tooltip title="Heure" disableInteractive>
          <ListItemIcon>
            <AccessTimeIcon />
          </ListItemIcon>
        </Tooltip>
        {time}
      </ListItem>
      {showLocation && (
        <ListItem disableGutters>
          <Tooltip title="Lieu" disableInteractive>
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
      )}
      {showKm && showLocation && location && (
        <ListItem disableGutters>
          <Tooltip title="Relevé kilométrique du véhicule" disableInteractive>
            <ListItemIcon>KM</ListItemIcon>
          </Tooltip>
          <EditableMissionInfo
            fullWidth
            value={location.kilometerReading}
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
            disabledEdit={km => kmError}
          />
        </ListItem>
      )}
    </List>
  );
}
