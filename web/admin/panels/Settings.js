import React from "react";
import { useApi } from "common/utils/api";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { EDIT_COMPANY_SETTINGS_MUTATION } from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { SimpleToggleSetting } from "../components/Setting";
import Divider from "@material-ui/core/Divider";
import { useAdminStore } from "../utils/store";

export default function SettingAdmin({ company }) {
  const api = useApi();
  const adminStore = useAdminStore();

  async function submitSettingChange(name, value) {
    const response = await api.graphQlMutate(
      EDIT_COMPANY_SETTINGS_MUTATION,
      { [name]: value, companyId: company.id },
      { context: { nonPublicApi: true } }
    );
    const payload = response.data.editCompanySettings;
    adminStore.setCompanies(
      adminStore.companies.map(c =>
        c.id === payload.id
          ? {
              ...c,
              ...payload
            }
          : c
      )
    );
  }

  const classes = usePanelStyles();

  return [
    <Box key={3} className={classes.title}>
      <Typography variant="h4">Paramètres</Typography>
    </Box>,
    <List key={4}>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="allowTeamMode"
          label="Mode équipe"
          value={company.allowTeamMode}
          description="Lors de missions en équipe ce mode donne la possibilité à l'un des équipiers d'enregistrer le temps de travail pour toute l'équipe (au lieu que chacun enregistre son propre temps de travail séparément). Chaque équipier doit toutefois valider individuellement les informations à la fin de la mission."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireKilometerData"
          label="Saisie du kilométrage"
          value={company.requireKilometerData}
          description="Exige le relevé du compteur kilométrique du véhicule en début et fin de mission, conformément aux exigences du Livret Individuel de Contrôle. Pour certains secteurs tels que le déménagment cette donnée n'est toutefois plus demandée."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireExpenditures"
          label="Saisie des frais"
          value={company.requireExpenditures}
          description="La gestion des frais de déplacement se fait dans Mobilic. Les travailleurs mobiles saisissent leurs frais en fin de mission et ceux-ci sont rendus visibles pour le gestionnaire (et présents dans les exports des données d'activité)."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
    </List>
  ];
}
