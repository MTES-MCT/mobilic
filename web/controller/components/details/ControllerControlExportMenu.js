import React from "react";
import Typography from "@mui/material/Typography";
import { ReactComponent as ExcelIcon } from "common/assets/images/excel.svg";
import { ReactComponent as XmlIcon } from "common/assets/images/xml.svg";
import { ReactComponent as C1bIcon } from "common/assets/images/tacho.svg";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { ListItemIcon, Menu, MenuItem, SvgIcon } from "@mui/material";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useModals } from "common/utils/modals";

export function ControllerControlExportMenu({ controlId, canDownloadXml }) {
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = React.useState(null);

  const isOpen = React.useMemo(() => !!exportMenuAnchorEl, [
    exportMenuAnchorEl
  ]);
  return (
    <>
      <Button
        id="control-export-button"
        aria-controls={isOpen ? "control-export-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : undefined}
        priority="secondary"
        size="small"
        onClick={e => setExportMenuAnchorEl(e.currentTarget)}
      >
        Exporter le contrôle
      </Button>
      <Menu
        id="control-export-menu"
        keepMounted
        open={isOpen}
        onClose={() => setExportMenuAnchorEl(null)}
        anchorEl={exportMenuAnchorEl}
        MenuListProps={{
          "aria-labelledby": "control-export-button"
        }}
      >
        <MenuItem
          onClick={() => {
            setExportMenuAnchorEl(null);
            modals.open("controllerExportC1BOne", {
              controlId
            });
          }}
        >
          <ListItemIcon>
            <SvgIcon viewBox="0 0 640 512" component={C1bIcon} />
          </ListItemIcon>
          <Typography>Export C1B</Typography>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setExportMenuAnchorEl(null);
            alerts.withApiErrorHandling(async () => {
              const options = {
                control_id: controlId
              };
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlExcelExport, {
                json: options
              });
            }, "download-control-export");
          }}
        >
          <ListItemIcon>
            <SvgIcon viewBox="0 0 64 64" component={ExcelIcon} />
          </ListItemIcon>
          <Typography>Export Excel</Typography>
        </MenuItem>
        <MenuItem
          disabled={!canDownloadXml}
          onClick={async () => {
            setExportMenuAnchorEl(null);
            alerts.withApiErrorHandling(async () => {
              const options = {
                control_id: controlId
              };
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlXmlExport, {
                json: options
              });
            }, "download-control-xml");
          }}
        >
          <ListItemIcon>
            <SvgIcon viewBox="0 0 64 64" component={XmlIcon} />
          </ListItemIcon>
          <Typography>Export XML</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
