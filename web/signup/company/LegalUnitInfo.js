import React from "react";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import { InfoItem } from "../../home/InfoField";
import CardContent from "@material-ui/core/CardContent";

export function LegalUnitInfo({ legalUnit }) {
  return (
    <Card style={{ textAlign: "left" }} variant="outlined">
      <CardContent>
        <Grid container wrap="wrap" spacing={4}>
          <Grid item>
            <InfoItem name="Nom" value={legalUnit.name} bold />
          </Grid>
          <Grid item>
            <InfoItem name="Code NAF" value={legalUnit.activity} />
          </Grid>
          {legalUnit.creation_date && (
            <Grid item>
              <InfoItem
                name="Année de création"
                value={legalUnit.creation_date.slice(0, 4)}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
