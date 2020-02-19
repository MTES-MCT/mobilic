import React from "react";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "../utils/expenditures";

export function Expenditures({ expenditures, pushNewExpenditure }) {
  return (
    <div>
      <Typography variant="h6" align="left" className="bold">
        Frais
      </Typography>
      <div className="expenditures-content">
        {Object.keys(EXPENDITURES).map(expenditureType => (
          <FormControlLabel
            key={expenditureType}
            control={
              <Checkbox
                size="small"
                className="expenditures-checkbox"
                checked={
                  expenditures.filter(e => e.type === expenditureType).length >
                    0 || false
                }
                disabled={
                  expenditures.filter(e => e.type === expenditureType).length >
                    0 || false
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
        ))}
      </div>
    </div>
  );
}
