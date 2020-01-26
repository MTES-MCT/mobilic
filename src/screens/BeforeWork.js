import React from "react";
import Container from "@material-ui/core/Container";
import {WorkDaySummary} from "../components/WorkTimeSummary";
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";


export function BeforeWork ({ previousDayTimers, previousDayStart, previousDayEnd, setOpenTeamSelectionModal, setOpenFirstActivityModal, clearTeam }) {
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
                    onClick={() => {clearTeam(); setOpenFirstActivityModal(true)}}
                >
                    Commencer la journée
                </Button>
                <div style={{height: "2vh"}} />
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    onClick={() => setOpenTeamSelectionModal(true)}
                >
                    Commencer en équipe
                </Button>
            </div>
        </Container>
    )
}