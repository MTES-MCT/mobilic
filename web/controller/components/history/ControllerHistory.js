import React from "react";
import { Accordion, AccordionItem, Table } from "@dataesr/react-dsfr";

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

export function ControllerHistory() {
  return (
    <Accordion size="lg" color="#3284FE">
      {dummyHistoControls.map(histo => (
        <AccordionItem title={histo.date} key={histo.date}>
          <Table
            rowKey={x => x.id}
            data={histo.entries}
            columns={columns}
          ></Table>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
