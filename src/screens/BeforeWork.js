import React from "react";
import Container from "@material-ui/core/Container";
import {WorkDaySummary} from "../components/WorkTimeSummary";
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import {SelectFirstActivityModal} from "../components/FirstActivitySelection";


export function BeforeWork ({ previousDayTimers, previousDayStart, previousDayEnd, pushFirstActivity }) {
    const [openFirstActivityModal, setOpenFirstActivityModal] = React.useState(false);
    return (
        <Container className="container scrollable">
            <WorkDaySummary
                timers={previousDayTimers}
                dayStart={previousDayStart}
                dayEnd={previousDayEnd}
                handleExport={() => console.log("caca")}
            />
            <div style={{height: "5vh", flexGrow: 1}} />
            <div className="start-buttons-container unshrinkable">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={() => setOpenFirstActivityModal(true)}
                >
                    Commencer la journée
                </Button>
                <div style={{height: "2vh"}} />
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    onClick={() => setOpenFirstActivityModal(true)}
                >
                    Commencer en équipe
                </Button>
            </div>
            <SelectFirstActivityModal
                open={openFirstActivityModal}
                handleClose={() => setOpenFirstActivityModal(false)}
                handleItemClick={(activity) => pushFirstActivity(activity)}
            />
        </Container>
    )
}