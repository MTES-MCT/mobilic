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
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";

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
    adminStore.dispatch({
      type: ADMIN_ACTIONS.update,
      payload: { id: company.id, entity: "companies", update: payload }
    });
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
          value={company.settings.allowTeamMode}
          description="Lors de missions en équipe ce mode donne la possibilité à l'un des équipiers d'enregistrer le temps de travail pour toute l'équipe (au lieu que chacun enregistre son propre temps de travail séparément). Chaque équipier doit toutefois valider individuellement les informations à la fin de la mission."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireSupportActivity"
          label="Temps d'accompagnement"
          value={company.settings.requireSupportActivity}
          description="Permet la distinction entre temps de conduite et temps d'accompagnement (c'est le temps passé à bord du véhicule lorsque quelqu'un d'autre conduit). Les travailleurs doivent préciser s'ils sont conducteurs ou non à chaque fois qu'ils sélectionnent l'activité Déplacement. Pour certaines entreprises le temps d'accompagnement est soumis à une rémunération spéciale (dans le déménagement par exemple)."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireKilometerData"
          label="Saisie du kilométrage"
          value={company.settings.requireKilometerData}
          description="Exige le relevé du compteur kilométrique du véhicule en début et fin de mission, conformément aux exigences du Livret Individuel de Contrôle. Pour certains secteurs tels que le déménagement cette donnée n'est toutefois plus demandée."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireExpenditures"
          label="Saisie des frais"
          value={company.settings.requireExpenditures}
          description="La gestion des frais de déplacement se fait dans Mobilic. Les travailleurs mobiles saisissent leurs frais en fin de mission et ceux-ci sont rendus visibles pour le gestionnaire (et présents dans les exports des données d'activité)."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
      <Divider />
      <ListItem>
        <SimpleToggleSetting
          name="requireMissionName"
          label="Nom de mission obligatoire"
          value={company.settings.requireMissionName}
          description="A la création d'une mission, le travailleur mobile doit obligatoirement saisir un nom pour celle-ci. Ce nom sera ensuite repris dans l'interface du gestionnaire pour un suivi plus fin du temps de travail et une meilleure visibilité dans les outils de reporting."
          submitSettingChange={submitSettingChange}
        />
      </ListItem>
    </List>
  ];
}
