import React from "react";

import Stack from "@mui/material/Stack";
import { Button, TextInput, Select } from "@dataesr/react-dsfr";

import { NATIONALITIES } from "../../utils/bulletinControle";

export function ControllerControlBulletinControle({
  bulletinControle,
  onSavingBulletinControle,
  onClose
}) {
  const [newBulletinControle, setNewBulletinControle] = React.useState(
    bulletinControle
  );
  React.useEffect(() => {
    setNewBulletinControle(bulletinControle);
  }, [bulletinControle]);

  const handleEditBulletinControle = e => {
    const { name, value } = e.target;
    setNewBulletinControle(prevState => ({
      ...prevState,
      [name]: value,
      touched: true
    }));
  };

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <TextInput
        value={newBulletinControle.lastName}
        name="lastName"
        onChange={e => handleEditBulletinControle(e)}
        label="Nom du salarié"
        required
      />
      <TextInput
        value={newBulletinControle.firstName}
        name="firstName"
        onChange={e => handleEditBulletinControle(e)}
        label="Prénom du salarié"
        required
      />
      <TextInput
        value={newBulletinControle.birthDate}
        name="birthDate"
        onChange={e => handleEditBulletinControle(e)}
        label="Date de naissance"
        required
        type="date"
      />
      <Select
        label="Label pour liste déroulante"
        selected={newBulletinControle.nationality}
        name="nationality"
        onChange={e => {
          handleEditBulletinControle(e);
        }}
        options={NATIONALITIES}
      />
      <Stack direction="row" justifyContent="flex-start" spacing={4}>
        <Button
          title="téléchargement"
          onClick={() => onSavingBulletinControle(newBulletinControle)}
        >
          Enregistrer
        </Button>
        <Button title="téléchargement" onClick={onClose} secondary>
          Annuler
        </Button>
      </Stack>
    </Stack>
  );
}
