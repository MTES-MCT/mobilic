import React from "react";

import Stack from "@mui/material/Stack";
import { Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <TextInput
        value={controlBulletin.locationDepartment || ""}
        name="locationDepartment"
        onChange={e => handleEditControlBulletin(e)}
        label="Département du contrôle"
        required
      />
      <TextInput
        value={controlBulletin.locationCommune || ""}
        name="locationCommune"
        onChange={e => handleEditControlBulletin(e)}
        label="Commune du contrôle"
        required
      />
      <TextInput
        value={controlBulletin.locationLieu || ""}
        name="locationLieu"
        onChange={e => handleEditControlBulletin(e)}
        label="Lieu du contrôle"
        required
      />
      <TextInput
        value={controlBulletin.userLastName || ""}
        name="userLastName"
        onChange={e => handleEditControlBulletin(e)}
        label="Nom du salarié"
        required
      />
      <TextInput
        value={controlBulletin.userFirstName || ""}
        name="userFirstName"
        onChange={e => handleEditControlBulletin(e)}
        label="Prénom du salarié"
        required
      />
      <TextInput
        value={controlBulletin.userBirthDate || ""}
        name="userBirthDate"
        onChange={e => handleEditControlBulletin(e)}
        label="Date de naissance du salarié"
        required
        type="date"
      />
      <Select
        label="Nationalité du salarié"
        selected={controlBulletin.userNationality || "FRA"}
        name="userNationality"
        required
        onChange={e => {
          handleEditControlBulletin(e);
        }}
        options={COUNTRIES}
      />
    </Stack>
  );
}
