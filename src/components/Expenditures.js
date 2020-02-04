import React from "react";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "../utils/expenditures";

export function Expenditures({ expenditures, setExpenditures }) {
  return (
    <div>
      <Typography variant="h6" className="expenditures-title">
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
                checked={expenditures[expenditureType] || false}
                disabled={expenditures[expenditureType] || false}
                onChange={() =>
                  setExpenditures({
                    ...expenditures,
                    [expenditureType]: !expenditures[expenditureType]
                  })
                }
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
