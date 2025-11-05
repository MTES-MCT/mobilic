import React from "react";
import { Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import RegulatoryRespectResults from "./RegulatoryRespectResults";
import RegulatoryRespectFilters from "./RegulatoryRespectFilters";

const useStyles = makeStyles(theme => ({
    description: {
        color: fr.colors.decisions.background.flat.grey.default
    },
    container: {
        backgroundColor: fr.colors.decisions.background.default.grey.hover,
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    }
}));

export default function RegulatoryRespectPanel() {
    const classes = useStyles();

    return (
        <>
            <Stack direction="column" className={classes.container} rowGap={1}>
                <Typography variant="h3" component="h1">Respect des seuils réglementaires</Typography>
                <Typography className={classes.description}>Suivez le respect des seuils réglementaires au sein de votre entreprise. Vous pouvez effectuer un suivi global ou personnalisé en utilisant les filtres ci-dessous.</Typography>
                <RegulatoryRespectFilters />
            </Stack>
            <RegulatoryRespectResults />
        </>
    );
}
