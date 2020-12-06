import React from "react";
import orderBy from "lodash/orderBy";
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
import DeleteIcon from "@material-ui/icons/Delete";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TableContainer from "@material-ui/core/TableContainer";
import Alert from "@material-ui/lab/Alert";
import MaterialTable from "@material-ui/core/Table";
import { Table, AutoSizer, Column, WindowScroller } from "react-virtualized";
import "react-virtualized/styles.css";
import { TextWithOverflowTooltip } from "./TextWithOverflowTooltip";

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    fontSize: "0.75em",
    cursor: "pointer",
    color: ({ sortType }) => (sortType ? theme.palette.primary.main : "inherit")
  },
  table: {
    "& td, th": {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingTop: ({ dense }) =>
        dense ? theme.spacing(0.5) : theme.spacing(2),
      paddingBottom: ({ dense }) =>
        dense ? theme.spacing(0.5) : theme.spacing(2)
    }
  },
  tableContainer: {
    maxHeight: "100%",
    overflowY: "hidden"
  },
  actionButton: {
    marginRight: theme.spacing(1)
  },
  row: {
    "& > *": {
      borderBottom: "unset"
    },
    "&:hover": {
      background: "#fafbfc"
    },
    borderTop: "0.5px solid #ebeff3",
    "&:first-child": {
      borderTop: "none"
    }
  },
  saveIcon: {
    color: theme.palette.success.main
  },
  cancelCreationButton: {
    marginLeft: theme.spacing(1)
  },
  header: {
    background: "#fafbfc",
    borderBottom: "1px solid #c9d3df",
    borderTop: "1px solid #c9d3df",
    borderRadius: "2px",
    fontWeight: 700,
    textTransform: "uppercase"
  },
  cell: {
    margin: "0 !important",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: ({ dense }) => (dense ? theme.spacing(0.5) : theme.spacing(2)),
    paddingBottom: ({ dense }) =>
      dense ? theme.spacing(0.5) : theme.spacing(2)
  },
  grid: {
    borderBottom: "1px solid #c9d3df"
  }
}));

export function AugmentedTable({
  columns,
  entries,
  onRowEdit,
  onRowAdd,
  onRowDelete,
  addButtonLabel,
  dense = false,
  defaultSortBy = undefined,
  defaultSortType = "asc",
  rowChangeAlertMessage = "",
  rowChangeAlertSeverity = "success",
  onRowChangeAlertClose = () => {},
  stickyHeader = false,
  className = ""
}) {
  const [sortBy, setSortBy] = React.useState(defaultSortBy);
  const [sortType, setSortType] = React.useState(
    defaultSortBy ? defaultSortType : undefined
  );

  const [editingRowId, setEditingRowId] = React.useState(null);
  const [editingValues, setEditingValues] = React.useState({});

  const classes = useStyles({ dense });

  const handleSortTypeChange = column => () => {
    let newSortType = "desc";
    if (sortBy === column && sortType === "desc") newSortType = "asc";
    setSortBy(column);
    setSortType(newSortType);
  };

  const isAddingRow = editingRowId === 0;
  const isEditingRow = editingRowId > 0;

  const editable = !!onRowEdit;
  const deletable = !!onRowDelete;

  const shouldDisplayEditActionsColumn = editable || isAddingRow || deletable;

  const renderEditActions = (entry, onFocus) => {
    if (!onFocus && !editable && !deletable) {
      return <TableCell />;
    }
    return (
      <TableCell align="right">
        {onFocus ? (
          isAddingRow ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  onRowAdd(editingValues);
                  setEditingRowId(null);
                }}
              >
                Créer
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className={classes.cancelCreationButton}
                onClick={() => setEditingRowId(null)}
              >
                Annuler
              </Button>
            </>
          ) : (
            <>
              <IconButton
                className="no-margin-no-padding"
                onClick={() => {
                  onRowEdit(entry, { ...editingValues });
                  setEditingRowId(null);
                }}
              >
                <CheckIcon className={classes.saveIcon} />
              </IconButton>
              <IconButton
                className="no-margin-no-padding"
                onClick={() => setEditingRowId(null)}
              >
                <CloseIcon color="error" />
              </IconButton>
            </>
          )
        ) : (
          <>
            {editable && (
              <IconButton
                className="no-margin-no-padding"
                color="primary"
                disabled={isAddingRow || isEditingRow}
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
            )}
            {deletable && (
              <IconButton
                className="no-margin-no-padding"
                disabled={isAddingRow || isEditingRow}
                onClick={() => onRowDelete(entry)}
              >
                <DeleteIcon
                  color={!isAddingRow && !isEditingRow ? "error" : ""}
                />
              </IconButton>
            )}
          </>
        )}
      </TableCell>
    );
  };

  const sortedEntries =
    sortBy && sortType ? orderBy(entries, [sortBy], [sortType]) : entries;

  const displayedEntries = isAddingRow
    ? [editingValues, ...sortedEntries]
    : sortedEntries;

  return (
    <Box className={`${className}`}>
      {onRowAdd ? (
        <Box
          className="flex-row"
          mb={2}
          style={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <Button
            variant="contained"
            size="small"
            disabled={editingRowId === 0}
            color="primary"
            onClick={() => {
              setEditingValues({});
              setEditingRowId(0);
            }}
            className={classes.actionButton}
          >
            {addButtonLabel}
          </Button>
          {rowChangeAlertMessage && (
            <Alert
              severity={rowChangeAlertSeverity}
              onClose={onRowChangeAlertClose}
            >
              {rowChangeAlertMessage}
            </Alert>
          )}
        </Box>
      ) : (
        rowChangeAlertMessage && (
          <Alert
            severity={rowChangeAlertSeverity}
            onClose={onRowChangeAlertClose}
          >
            {rowChangeAlertMessage}
          </Alert>
        )
      )}
      <TableContainer className={` ${classes.tableContainer}`}>
        <MaterialTable
          stickyHeader={stickyHeader}
          className={`table ${classes.table}`}
          size={dense ? "small" : "medium"}
        >
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.name}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth || "unset" }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.name}
                      direction={sortBy === column.name ? sortType : "desc"}
                      onClick={handleSortTypeChange(column.name)}
                      style={{
                        flexDirection:
                          column.align === "right" ? "row-reverse" : "row"
                      }}
                    >
                      {column.renderLabel ? column.renderLabel() : column.label}
                    </TableSortLabel>
                  ) : column.renderLabel ? (
                    column.renderLabel()
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {shouldDisplayEditActionsColumn && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedEntries.map((entry, index) => {
              const onFocus =
                (isAddingRow && index === 0) || editingRowId === entry.id;
              return (
                <TableRow key={entry.id} hover>
                  {columns.map(column => {
                    const CellInnerComponent = column.overflowTooltip
                      ? TextWithOverflowTooltip
                      : React.Fragment;
                    if (
                      onFocus &&
                      ((isAddingRow && column.create) ||
                        (!isAddingRow && column.edit))
                    ) {
                      return (
                        <TableCell
                          key={column.name}
                          align={column.align || "left"}
                          style={{ minWidth: column.minWidth || "unset" }}
                        >
                          {column.boolean ? (
                            <Checkbox
                              checked={editingValues[column.name] || false}
                              color="primary"
                              onChange={e =>
                                setEditingValues(values => ({
                                  ...values,
                                  [column.name]: e.target.checked
                                }))
                              }
                            />
                          ) : (
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
                          )}
                        </TableCell>
                      );
                    } else
                      return (
                        <TableCell
                          key={column.name}
                          align={column.align || "left"}
                          style={{ minWidth: column.minWidth || "unset" }}
                        >
                          <CellInnerComponent>
                            {column.boolean ? (
                              <Checkbox
                                checked={entry[column.name] || false}
                                disabled
                              />
                            ) : column.format ? (
                              column.format(entry[column.name], entry, onFocus)
                            ) : entry[column.name] ? (
                              entry[column.name]
                            ) : null}
                          </CellInnerComponent>
                        </TableCell>
                      );
                  })}
                  {shouldDisplayEditActionsColumn &&
                    renderEditActions(entry, onFocus)}
                </TableRow>
              );
            })}
          </TableBody>
        </MaterialTable>
      </TableContainer>
    </Box>
  );
}

function VirtualizedTable({
  columns,
  entries,
  classes,
  width,
  height,
  minHeight,
  headerHeight,
  rowHeight,
  isAddingRow,
  isRowOnFocus,
  headerRenderer,
  columnDefaultMinWidth,
  columnDefaultBaseWidth,
  shouldDisplayEditActionsColumn,
  renderEditActions,
  editingValues,
  setEditingValues,
  onScroll = () => {},
  scrollTop = null,
  autoHeight = false
}) {
  const minTableWidth =
    columns.reduce((acc, col) => {
      return acc + (col.minWidth || columnDefaultMinWidth);
    }, 0) + (shouldDisplayEditActionsColumn ? columnDefaultMinWidth : 0);
  return (
    <Table
      autoHeight={autoHeight}
      className={`table ${classes.table}`}
      width={Math.max(width, minTableWidth)}
      height={Math.max(height, minHeight)}
      headerHeight={headerHeight}
      rowCount={entries.length}
      rowGetter={({ index }) => entries[index]}
      rowHeight={rowHeight}
      rowClassName={({ index }) => (index >= 0 ? classes.row : classes.header)}
      onScroll={onScroll}
      scrollTop={scrollTop}
    >
      {columns.map(column => {
        return (
          <Column
            key={column.name}
            flexGrow={1}
            dataKey={column.name}
            className={classes.cell}
            headerClassName={classes.cell}
            cellDataGetter={({ rowData, dataKey }) => {
              return rowData[dataKey];
            }}
            cellRenderer={({ rowData, cellData, rowIndex }) => {
              const onFocus = isRowOnFocus(rowData, rowIndex);
              const CellInnerComponent = column.overflowTooltip
                ? TextWithOverflowTooltip
                : React.Fragment;
              if (
                onFocus &&
                ((isAddingRow && column.create) ||
                  (!isAddingRow && column.edit))
              ) {
                return (
                  <>
                    {column.boolean ? (
                      <Checkbox
                        checked={editingValues[column.name] || false}
                        color="primary"
                        onChange={e =>
                          setEditingValues(values => ({
                            ...values,
                            [column.name]: e.target.checked
                          }))
                        }
                      />
                    ) : (
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
                    )}
                  </>
                );
              } else
                return (
                  <CellInnerComponent>
                    {column.boolean ? (
                      <Checkbox checked={cellData || false} disabled />
                    ) : column.format ? (
                      column.format(cellData, rowData, onFocus)
                    ) : cellData ? (
                      cellData
                    ) : null}
                  </CellInnerComponent>
                );
            }}
            style={{ textAlign: column.align }}
            headerStyle={{ textAlign: column.align }}
            headerRenderer={() => headerRenderer(column)}
            width={column.baseWidth || columnDefaultBaseWidth}
            minWidth={column.minWidth || columnDefaultMinWidth}
          />
        );
      })}
      {shouldDisplayEditActionsColumn && (
        <Column
          disableSort
          dataKey="edit"
          className={classes.cell}
          headerClassName={classes.cell}
          cellDataGetter={() => 0}
          cellRenderer={({ rowData, rowIndex }) =>
            renderEditActions(rowData, rowIndex)
          }
          headerRenderer={() => ""}
          style={{ textAlign: "center" }}
          headerStyle={{ textAlign: "center" }}
          width={columnDefaultBaseWidth}
          minWidth={columnDefaultMinWidth}
          flexGrow={1}
        />
      )}
    </Table>
  );
}

export function AugmentedVirtualizedTable({
  columns,
  entries,
  onRowEdit,
  onRowAdd,
  onRowDelete,
  addButtonLabel,
  dense = false,
  defaultSortBy = undefined,
  defaultSortType = "asc",
  rowChangeAlertMessage = "",
  rowChangeAlertSeverity = "success",
  onRowChangeAlertClose = () => {},
  headerHeight = 60,
  rowHeight = 40,
  minHeight = 0,
  maxHeight = "100%",
  columnDefaultBaseWidth = 200,
  columnDefaultMinWidth = 200,
  className = "",
  attachScrollTo = null
}) {
  const [sortBy, setSortBy] = React.useState(defaultSortBy);
  const [sortType, setSortType] = React.useState(
    defaultSortBy ? defaultSortType : undefined
  );

  const [editingRowId, setEditingRowId] = React.useState(null);
  const [editingValues, setEditingValues] = React.useState({});

  const classes = useStyles({ dense });

  const handleSortTypeChange = column => () => {
    let newSortType = "desc";
    if (sortBy === column && sortType === "desc") newSortType = "asc";
    setSortBy(column);
    setSortType(newSortType);
  };

  const isAddingRow = editingRowId === 0;
  const isEditingRow = editingRowId > 0;

  const editable = !!onRowEdit;
  const deletable = !!onRowDelete;

  const shouldDisplayEditActionsColumn = editable || isAddingRow || deletable;

  const isRowOnFocus = (entry, index) =>
    (isAddingRow && index === 0) || editingRowId === entry.id;

  const renderEditActions = (entry, index) => {
    const onFocus = isRowOnFocus(entry, index);
    if (!onFocus && !editable && !deletable) {
      return null;
    }
    return (
      <>
        {onFocus ? (
          isAddingRow ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  onRowAdd(editingValues);
                  setEditingRowId(null);
                }}
              >
                Créer
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className={classes.cancelCreationButton}
                onClick={() => setEditingRowId(null)}
              >
                Annuler
              </Button>
            </>
          ) : (
            <>
              <IconButton
                className="no-margin-no-padding"
                onClick={() => {
                  onRowEdit(entry, { ...editingValues });
                  setEditingRowId(null);
                }}
              >
                <CheckIcon className={classes.saveIcon} />
              </IconButton>
              <IconButton
                className="no-margin-no-padding"
                onClick={() => setEditingRowId(null)}
              >
                <CloseIcon color="error" />
              </IconButton>
            </>
          )
        ) : (
          <>
            {editable && (
              <IconButton
                className="no-margin-no-padding"
                color="primary"
                disabled={isAddingRow || isEditingRow}
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
            )}
            {deletable && (
              <IconButton
                className="no-margin-no-padding"
                disabled={isAddingRow || isEditingRow}
                onClick={() => onRowDelete(entry)}
              >
                <DeleteIcon
                  color={!isAddingRow && !isEditingRow ? "error" : ""}
                />
              </IconButton>
            )}
          </>
        )}
      </>
    );
  };

  const _headerRenderer = column => {
    return column.sortable ? (
      <>
        <TableSortLabel
          active={sortBy === column.name}
          direction={sortBy === column.name ? sortType : "desc"}
          onClick={handleSortTypeChange(column.name)}
          style={{
            flexDirection: column.align === "right" ? "row-reverse" : "row"
          }}
        >
          {column.renderLabel ? column.renderLabel() : column.label}
        </TableSortLabel>
      </>
    ) : column.renderLabel ? (
      column.renderLabel()
    ) : (
      column.label
    );
  };

  const sortedEntries =
    sortBy && sortType ? orderBy(entries, [sortBy], [sortType]) : entries;

  const displayedEntries = isAddingRow
    ? [editingValues, ...sortedEntries]
    : sortedEntries;

  return (
    <Box className={`${className} flex-column`}>
      {onRowAdd ? (
        <Box
          className="flex-row"
          mb={2}
          style={{ flexWrap: "wrap", alignItems: "center" }}
        >
          <Button
            variant="contained"
            size="small"
            disabled={editingRowId === 0}
            color="primary"
            onClick={() => {
              setEditingValues({});
              setEditingRowId(0);
            }}
            className={classes.actionButton}
          >
            {addButtonLabel}
          </Button>
          {rowChangeAlertMessage && (
            <Alert
              severity={rowChangeAlertSeverity}
              onClose={onRowChangeAlertClose}
            >
              {rowChangeAlertMessage}
            </Alert>
          )}
        </Box>
      ) : (
        rowChangeAlertMessage && (
          <Alert
            severity={rowChangeAlertSeverity}
            onClose={onRowChangeAlertClose}
          >
            {rowChangeAlertMessage}
          </Alert>
        )
      )}
      <TableContainer
        style={{
          height: Math.max(
            displayedEntries.length * rowHeight + headerHeight,
            minHeight
          ),
          maxHeight,
          overflowY: "hidden"
        }}
      >
        {attachScrollTo ? (
          <WindowScroller scrollElement={attachScrollTo}>
            {({
              height,
              isScrolling,
              registerChild,
              onChildScroll,
              scrollTop
            }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <div ref={registerChild}>
                    <VirtualizedTable
                      columns={columns}
                      entries={displayedEntries}
                      classes={classes}
                      width={width}
                      height={height}
                      minHeight={minHeight}
                      headerHeight={headerHeight}
                      rowHeight={rowHeight}
                      isAddingRow={isAddingRow}
                      isRowOnFocus={isRowOnFocus}
                      headerRenderer={_headerRenderer}
                      columnDefaultMinWidth={columnDefaultMinWidth}
                      columnDefaultBaseWidth={columnDefaultBaseWidth}
                      shouldDisplayEditActionsColumn={
                        shouldDisplayEditActionsColumn
                      }
                      renderEditActions={renderEditActions}
                      editingValues={editingValues}
                      setEditingValues={setEditingValues}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}
                      autoHeight={true}
                    />
                  </div>
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        ) : (
          <AutoSizer>
            {({ width, height }) => {
              return (
                <VirtualizedTable
                  columns={columns}
                  entries={displayedEntries}
                  classes={classes}
                  width={width}
                  height={height}
                  minHeight={minHeight}
                  headerHeight={headerHeight}
                  rowHeight={rowHeight}
                  isAddingRow={isAddingRow}
                  isRowOnFocus={isRowOnFocus}
                  headerRenderer={_headerRenderer}
                  columnDefaultMinWidth={columnDefaultMinWidth}
                  columnDefaultBaseWidth={columnDefaultBaseWidth}
                  shouldDisplayEditActionsColumn={
                    shouldDisplayEditActionsColumn
                  }
                  renderEditActions={renderEditActions}
                  editingValues={editingValues}
                  setEditingValues={setEditingValues}
                />
              );
            }}
          </AutoSizer>
        )}
      </TableContainer>
    </Box>
  );
}
