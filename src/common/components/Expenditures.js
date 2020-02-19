import React from "react";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "../utils/expenditures";
import Grid from "@material-ui/core/Grid";

export function Expenditures({ expenditures, pushNewExpenditure }) {
  return (
    <div>
      <Typography variant="h6" align="left" className="bold">
        Frais
      </Typography>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        {Object.keys(EXPENDITURES).map(expenditureType => (
          <Grid
            key={expenditureType}
            item
            xs={6}
            md={3}
            justify="flex-start"
            style={{ textAlign: "left" }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  className="expenditures-checkbox"
                  checked={
                    expenditures.filter(e => e.type === expenditureType)
                      .length > 0 || false
                  }
                  disabled={
                    expenditures.filter(e => e.type === expenditureType)
                      .length > 0 || false
                  }
                  onChange={() => pushNewExpenditure(expenditureType)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  {EXPENDITURES[expenditureType]["label"]}
                </Typography>
              }
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
