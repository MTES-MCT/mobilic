import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { ReactComponent as ExcelIcon } from "common/assets/images/excel.svg";
import { ReactComponent as XmlIcon } from "common/assets/images/xml.svg";

import { ListItemIcon, Menu, MenuItem, SvgIcon } from "@mui/material";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function ControllerControlExportMenu({ controlId }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = React.useState(null);

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        onClick={e => setExportMenuAnchorEl(e.currentTarget)}
      >
        Exporter le contrôle
      </Button>
      <Menu
        keepMounted
        open={Boolean(exportMenuAnchorEl)}
        onClose={() => setExportMenuAnchorEl(null)}
        anchorEl={exportMenuAnchorEl}
      >
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
