import React from "react";

import Stack from "@mui/material/Stack";
import { Radio, RadioGroup, Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <RadioGroup
        legend="LIC papier présenté ?"
        isInline
        required
        onChange={e =>
          handleEditControlBulletin({
            target: { name: "licPaperPresented", value: e === "true" }
          })
        }
      >
        <Radio
          label="Oui"
          value={"true"}
          defaultChecked={controlBulletin.licPaperPresented}
        />
        <Radio
          label="Non"
          value={"false"}
          defaultChecked={controlBulletin.licPaperPresented === false}
        />
      </RadioGroup>
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
