import React from "react";

import Stack from "@mui/material/Stack";
import { Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <TextInput
        value={controlBulletin.locationDepartment || ""}
        name="locationDepartment"
        onChange={e => handleEditControlBulletin(e)}
        label="Département du contrôle"
        required
        messageType={
          !controlBulletin.locationDepartment && showErrors ? "error" : ""
        }
      />
      <TextInput
        value={controlBulletin.locationCommune || ""}
        name="locationCommune"
        onChange={e => handleEditControlBulletin(e)}
        label="Commune du contrôle"
        required
        messageType={
          !controlBulletin.locationCommune && showErrors ? "error" : ""
        }
      />
      <TextInput
        value={controlBulletin.locationLieu || ""}
        name="locationLieu"
        onChange={e => handleEditControlBulletin(e)}
        label="Lieu du contrôle"
        required
        messageType={!controlBulletin.locationLieu && showErrors ? "error" : ""}
      />
      <TextInput
        value={controlBulletin.userLastName || ""}
        name="userLastName"
        onChange={e => handleEditControlBulletin(e)}
        label="Nom du salarié"
        required
        messageType={!controlBulletin.userLastName && showErrors ? "error" : ""}
      />
      <TextInput
        value={controlBulletin.userFirstName || ""}
        name="userFirstName"
        onChange={e => handleEditControlBulletin(e)}
        label="Prénom du salarié"
        required
        messageType={
          !controlBulletin.userFirstName && showErrors ? "error" : ""
        }
      />
      <TextInput
        value={controlBulletin.userBirthDate || ""}
        name="userBirthDate"
        onChange={e => handleEditControlBulletin(e)}
        label="Date de naissance du salarié"
        required
        type="date"
        messageType={
          !controlBulletin.userBirthDate && showErrors ? "error" : ""
        }
      />
      <Select
        label="Nationalité du salarié"
        selected={controlBulletin.userNationality}
        name="userNationality"
        required
        onChange={e => {
          handleEditControlBulletin(e);
        }}
        options={COUNTRIES}
        messageType={
          !controlBulletin.userNationality && showErrors ? "error" : ""
        }
      />
    </Stack>
  );
}
