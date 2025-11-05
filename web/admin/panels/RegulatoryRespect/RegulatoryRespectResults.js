import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Typography } from "@mui/material";

const useStyles = makeStyles(theme => ({
    text: {
        color: fr.colors.decisions.background.flat.grey.default
    },
}));

export default function RegulatoryRespectResults() {
    const classes = useStyles()
    return (
        <Typography sx={{ margin: "auto" }} className={classes.text} > Aucun temps de travail sur la période sélectionnée.</Typography >
    );
}
