import { useMemo } from 'react';
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useLoadingScreen } from "common/utils/loading";
import { useActions } from "common/utils/actions";

export const useNewMissionFunnel = () => {
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const actions = useActions();
  
  

  const lastCompanyId = store.lastSelectedCompanyId();
  const companies = store.companies();
  const userId = store.userId();


  const areAllCompaniesWithoutAdmins = useMemo(
    () => companies.every(c => !!c.hasNoAdmin),
    [companies]
  );

  const handleFirstActivitySelection = (teamMates, missionInfos) => {
    const team = teamMates ? [userId, ...teamMates.map(cw => cw.id)] : [userId];
    modals.open("firstActivity", {
      team,
      handleActivitySelection: async (
          activityType,
          driverId,
          vehicle,
          kilometerReading
      ) => {
        await withLoadingScreen(
          async () => {
            await actions.beginNewMission({
                firstActivityType: activityType,
                driverId,
                companyId: missionInfos.company.id,
                name: missionInfos.mission,
                vehicle: vehicle || missionInfos.vehicle || null,
                startLocation: missionInfos.address,
                kilometerReading:
                    kilometerReading || missionInfos.kilometerReading,
                team
            });
            await modals.closeAll();
          },
          {},
          true
        );
      },
      requireVehicle: !missionInfos.vehicle,
      company: missionInfos.company
    });
  };

  const onEnterNewMissionFunnel = () => {
    if (areAllCompaniesWithoutAdmins) {
      modals.open("blockedTime", {});
    } else {
      modals.open("newMission", {
        companies,
        currentCompanyId: lastCompanyId,
        companyAddresses: store.getEntity("knownAddresses"),
        handleContinue: missionInfos => {
          const company = companies.find(c => c.id === missionInfos.company.id);
          if (company.settings && company.settings.allowTeamMode) {
            modals.open("teamOrSoloChoice", {
              handleContinue: isTeamMode => {
                if (isTeamMode) {
                  modals.open("teamSelection", {
                    mission: null,
                    companyId: missionInfos.company.id,
                    handleContinue: teamMates =>
                      handleFirstActivitySelection(teamMates, missionInfos)
                  });
                } else handleFirstActivitySelection(null, missionInfos);
              }
            });
          } else handleFirstActivitySelection(null, missionInfos);
        },
        onSelectNoAdminCompany: () => modals.open("blockedTime", {})
      });
    }
  };

  return {
    onEnterNewMissionFunnel
  };
};
