import React from "react";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import { TextInput, Select } from "@dataesr/react-dsfr";
import { NATIONALITIES } from "../../utils/bulletinControle";

export function ControllerControlBulletinControle({
  onClose,
  bulletinControle,
  editBulletinControle
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Button onClick={onClose}>Retour</Button>
      <TextInput
        value={bulletinControle.lastName}
        name="lastName"
        onChange={e => editBulletinControle(e)}
        label="Nom du salarié"
        required
      />
      <TextInput
        value={bulletinControle.firstName}
        name="firstName"
        onChange={e => editBulletinControle(e)}
        label="Prénom du salarié"
        required
      />
      <TextInput
        value={bulletinControle.birthDate}
        name="birthDate"
        onChange={e => editBulletinControle(e)}
        label="Date de naissance"
        required
        type="date"
      />
      <Select
        label="Label pour liste déroulante"
        selected={bulletinControle.nationality}
        name="nationality"
        onChange={e => {
          editBulletinControle(e);
        }}
        options={NATIONALITIES}
      />
    </Stack>
  );
}
