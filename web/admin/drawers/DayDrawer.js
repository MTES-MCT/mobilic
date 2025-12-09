import React from "react";
import { useWidth } from "common/utils/useWidth";
import { WorkTimeDetails } from "../components/WorkTimeDetails";
import { Drawer } from "./Drawer";
import { useMissionDrawer } from "./MissionDrawer";

const DayDrawerContext = React.createContext(() => {});

export function DayDrawerContextProvider({ children }) {
  const width = useWidth();
  const openMission = useMissionDrawer()[1];
  const [workdayOnFocus, setWorkdayOnFocus] = React.useState(null);

  return (
    <DayDrawerContext.Provider
      value={{
        openedWorkday: workdayOnFocus,
        openWorkday: (workday) => setWorkdayOnFocus(workday)
      }}
    >
      <Drawer
        open={!!workdayOnFocus}
        onClose={() => setWorkdayOnFocus(null)}
        zIndex={1503}
        id="day-drawer"
      >
        {workdayOnFocus && (
          <WorkTimeDetails
            workTimeEntry={workdayOnFocus}
            openMission={openMission}
            handleClose={() => {
              setWorkdayOnFocus(null);
            }}
            width={width}
          />
        )}
      </Drawer>
      {children}
    </DayDrawerContext.Provider>
  );
}

export const useDayDrawer = () => React.useContext(DayDrawerContext);
