import React from "react";
import { Table } from "@dataesr/react-dsfr";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { makeStyles } from "@mui/styles";

const dummyHistoControls = ["Jeudi 16 juin 2022", "Vendredi 17 juin 2022"].map(
  date => ({
    date,
    entries: [
      {
        id: 1,
        company: "nom XYZ",
        employee: "Emile Dafont",
        vehicle: "1234ABC01"
      },
      {
        id: 2,
        company: "nom XYZ",
        employee: "Léa Moti",
        vehicle: "1234ABC01"
      },
      {
        id: 3,
        company: "nom XYZ",
        employee: "Johan Guirec",
        vehicle: "1234ABC01"
      }
    ]
  })
);

const columns = [
  { name: "company", label: "Nom entreprise" },
  { name: "employee", label: "Salarié" },
  { name: "vehicle", label: "Véhicule" }
];

const useStyles = makeStyles(theme => ({
  icon: {
    fontSize: "0.9rem",
    color: "#3284FE"
  },
  summary: {
    color: "#3284FE",
    borderBottom: "1px solid #3284FE",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)"
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1)
    }
  },
  details: {
    padding: 0
  }
}));

export function ControllerHistory({ controls }) {
  const classes = useStyles();

  return dummyHistoControls.map(histo => (
    <Accordion key={`entries_${histo.date}`} disableGutters elevation={0}>
      <AccordionSummary
        aria-controls="panel1d-content"
        id="panel1d-header"
        expandIcon={<ArrowForwardIosSharpIcon className={classes.icon} />}
        className={classes.summary}
      >
        <Typography>{histo.date}</Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Table
          rowKey={x => x.id}
          data={histo.entries}
          columns={columns}
        ></Table>
      </AccordionDetails>
    </Accordion>
  ));
}
