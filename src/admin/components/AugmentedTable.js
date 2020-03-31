import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import EditIcon from "@material-ui/icons/Edit";
import makeStyles from "@material-ui/core/styles/makeStyles";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import useTheme from "@material-ui/core/styles/useTheme";

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    fontSize: "0.75em",
    cursor: "pointer",
    color: ({ sortType }) => (sortType ? theme.palette.primary.main : "inherit")
  }
}));

function TableCellWithSort({ sortType, onSortTypeChange, children }) {
  const classes = useStyles({ sortType });
  return (
    <TableCell>
      <span>{children}</span>
      <span className={classes.root} onClick={onSortTypeChange}>
        {sortType === "asc" ? "▲" : "▼"}
      </span>
    </TableCell>
  );
}

export function AugmentedTable({
  columns,
  entries,
  onRowEdit,
  onRowAdd,
  addButtonLabel,
  editable = true
}) {
  const theme = useTheme();
  const [sortBy, setSortBy] = React.useState(undefined);
  const [sortType, setSortType] = React.useState(undefined);

  const [editingRowId, setEditingRowId] = React.useState(null);
  const [editingValues, setEditingValues] = React.useState({});

  const handleSortTypeChange = column => () => {
    let newSortType = "desc";
    if (sortBy === column && sortType === "desc") newSortType = "asc;";
    setSortBy(column);
    setSortType(newSortType);
  };

  function compare(a, b) {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
  }

  const isAddingRow = editingRowId === 0;

  const shouldDisplayEditActionsColumn = editable || isAddingRow;

  const renderEditActions = (entry, onFocus) => {
    if (!onFocus && !editable) {
      return <TableCell />;
    }
    if (!onFocus) {
      return (
        <TableCell>
          <IconButton
            className="no-margin-no-padding"
            color="primary"
            onClick={() => {
              const initialValues = {};
              columns.forEach(column => {
                if (column.edit)
                  initialValues[column.name] = entry[column.name];
              });
              setEditingValues(initialValues);
              setEditingRowId(entry.id);
            }}
          >
            <EditIcon />
          </IconButton>
        </TableCell>
      );
    }
    return (
      <TableCell>
        <Box style={{ display: "flex" }}>
          <IconButton
            className="no-margin-no-padding"
            color="primary"
            onClick={() => {
              isAddingRow
                ? onRowAdd(editingValues)
                : onRowEdit(entry, { ...editingValues });
              setEditingRowId(null);
            }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            className="no-margin-no-padding"
            onClick={() => setEditingRowId(null)}
          >
            <CloseIcon color="error" />
          </IconButton>
        </Box>
      </TableCell>
    );
  };

  const sortedEntries =
    sortBy && sortType
      ? entries.sort((entry1, entry2) =>
          sortType === "desc"
            ? compare(entry1[sortBy] || "", entry2[sortBy] || "")
            : compare(entry2[sortBy] || "", entry1[sortBy] || "")
        )
      : entries;

  const displayedEntries = isAddingRow
    ? [editingValues, ...sortedEntries]
    : sortedEntries;

  return (
    <Box className="flex-column" style={{ alignItems: "flex-start" }}>
      {onRowAdd && (
        <Button
          variant="contained"
          size="small"
          disabled={editingRowId === 0}
          color="primary"
          onClick={() => {
            setEditingValues({});
            setEditingRowId(0);
          }}
          style={{ marginBottom: theme.spacing(2) }}
        >
          {addButtonLabel}
        </Button>
      )}
      <Table className="work-time-table">
        <TableHead>
          {shouldDisplayEditActionsColumn && <TableCell />}
          {columns.map(column =>
            column.sortable ? (
              <TableCellWithSort
                key={column.name}
                sortType={sortBy === column.name ? sortType : undefined}
                onSortTypeChange={handleSortTypeChange(column.name)}
              >
                {column.renderLabel ? column.renderLabel() : column.label}
              </TableCellWithSort>
            ) : (
              <TableCell key={column.name}>
                {column.renderLabel ? column.renderLabel() : column.label}
              </TableCell>
            )
          )}
        </TableHead>
        <TableBody>
          {displayedEntries.map((entry, index) => {
            const onFocus =
              (isAddingRow && index === 0) || editingRowId === entry.id;
            return (
              <TableRow key={index}>
                {shouldDisplayEditActionsColumn &&
                  renderEditActions(entry, onFocus)}
                {columns.map(column => {
                  if (
                    onFocus &&
                    ((isAddingRow && column.create) ||
                      (!isAddingRow && column.edit))
                  ) {
                    return (
                      <TableCell key={column.name}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          margin="dense"
                          label={column.label}
                          value={editingValues[column.name] || ""}
                          onChange={e => {
                            const newValue = e.target.value;
                            setEditingValues(values => ({
                              ...values,
                              [column.name]: newValue
                            }));
                          }}
                        />
                      </TableCell>
                    );
                  } else
                    return (
                      <TableCell
                        key={column.name}
                        style={column.cellStyle || {}}
                      >
                        {entry[column.name]
                          ? column.format
                            ? column.format(entry[column.name])
                            : entry[column.name]
                          : null}
                      </TableCell>
                    );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
