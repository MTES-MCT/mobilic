import React from "react";
import orderBy from "lodash/orderBy";
import isEqual from "lodash/isEqual";
import sum from "lodash/sum";
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
import MaterialTable from "@material-ui/core/Table";
import {
  Table,
  AutoSizer,
  Column,
  WindowScroller,
  defaultTableRowRenderer
} from "react-virtualized";
import "react-virtualized/styles.css";
import { TextWithOverflowTooltip } from "./TextWithOverflowTooltip";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

const overflowStyleForMaxWidthCells = {
  overflowX: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

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
        dense ? theme.spacing(0.5) : theme.spacing(2),
      fontSize: ({ small }) => (small ? "0.75rem" : null)
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
    boxSizing: "border-box",
    fontSize: ({ small }) => (small ? "0.75rem" : "inherit"),
    "& > *": {
      borderBottom: "unset"
    },
    "&:hover": {
      background: "#fafbfc",
      cursor: ({ clickableRow }) => (clickableRow ? "pointer" : "inherit")
    },
    borderTop: "0.5px solid #ebeff3",
    "&:first-child": {
      borderTop: "none"
    },
    "&:focus": {
      outline: "none"
    }
  },
  selected: {
    background: theme.palette.primary.lighter
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
    textTransform: "uppercase",
    fontSize: ({ small }) => (small ? "0.75rem" : "inherit")
  },
  cell: {
    margin: "0 !important",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: ({ dense }) => (dense ? theme.spacing(0.5) : theme.spacing(2)),
    paddingBottom: ({ dense }) =>
      dense ? theme.spacing(0.5) : theme.spacing(2)
  }
}));

export function CellContent({ column, cellData, rowData, onFocus }) {
  const CellInnerComponent = column.overflowTooltip
    ? TextWithOverflowTooltip
    : React.Fragment;
  const cellInnerComponentProps = column.overflowTooltip
    ? {
        text: column.formatTooltipContent
          ? column.formatTooltipContent(cellData, rowData)
          : null,
        alwaysShow: column.alwaysShowTooltip
      }
    : {};
  return (
    <CellInnerComponent {...cellInnerComponentProps}>
      {column.boolean ? (
        <Checkbox checked={cellData || false} disabled />
      ) : column.format ? (
        column.format(cellData, rowData, onFocus)
      ) : cellData ? (
        cellData
      ) : null}
    </CellInnerComponent>
  );
}

class Row extends React.Component {
  constructor(props) {
    super(props);
    this.state = { openCollapse: false };
  }

  shouldComponentUpdate(props, state, context) {
    if (this.state.openCollapse !== state.openCollapse) return true;
    if (!isEqual(this.props.entry, props.entry)) return true;
    if (this.props.onFocus !== props.onFocus) return true;
    if (this.props.collapsable !== props.collapsable) return true;
    if (this.props.rowClassName !== props.rowClassName) return true;
    if (this.props.editingValues !== props.editingValues && this.props.onFocus)
      return true;
    if (
      this.props.shouldDisplayEditActionsColumn !==
      props.shouldDisplayEditActionsColumn
    )
      return true;
    if (this.props.isAddingRow !== props.isAddingRow) return true;
    return false;
  }

  render() {
    const {
      columns,
      entry,
      onFocus,
      isAddingRow,
      editingValues,
      setEditingValues,
      shouldDisplayEditActionsColumn,
      renderEditActions,
      collapsable,
      rowClassName,
      renderCollapse
    } = this.props;
    const noBorderBottomStyle = this.state.openCollapse
      ? { borderBottom: "unset" }
      : {};
    return (
      <>
        <TableRow
          hover
          className={rowClassName}
          {...noBorderBottomStyle}
          onClick={
            collapsable
              ? () => this.setState({ openCollapse: !this.state.openCollapse })
              : null
          }
        >
          {collapsable && (
            <TableCell>
              <IconButton
                size="small"
                onClick={() =>
                  this.setState({ openCollapse: !this.state.openCollapse })
                }
              >
                {this.state.openCollapse ? (
                  <KeyboardArrowUpIcon fontSize="inherit" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="inherit" />
                )}
              </IconButton>
            </TableCell>
          )}
          {columns.map(column => {
            let cellStyle = {
              minWidth: column.minWidth,
              maxWidth: column.maxWidth
            };
            if (column.maxWidth)
              cellStyle = { ...cellStyle, ...overflowStyleForMaxWidthCells };
            if (
              onFocus &&
              ((isAddingRow && column.create) || (!isAddingRow && column.edit))
            ) {
              return (
                <TableCell
                  key={column.name}
                  align={column.align || "left"}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
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
                  style={cellStyle}
                >
                  <CellContent
                    cellData={entry[column.name]}
                    rowData={entry}
                    onFocus={onFocus}
                    column={column}
                  />
                </TableCell>
              );
          })}
          {shouldDisplayEditActionsColumn && renderEditActions(entry, onFocus)}
        </TableRow>
        {collapsable && this.state.openCollapse && (
          <TableRow>
            <TableCell colSpan={10}>{renderCollapse(entry)}</TableCell>
          </TableRow>
        )}
      </>
    );
  }
}

export function AugmentedTable({
  columns,
  entries,
  onRowEdit,
  onRowAdd,
  triggerRowAdd = { value: false },
  disableAdd = null,
  onRowDelete,
  afterRowAdd = null,
  renderCollapse = null,
  dense = false,
  small = false,
  defaultSortBy = undefined,
  defaultSortType = "asc",
  stickyHeader = false,
  className = ""
}) {
  const [sortBy, setSortBy] = React.useState(defaultSortBy);
  const [sortType, setSortType] = React.useState(
    defaultSortBy ? defaultSortType : undefined
  );

  const [editingRowId, setEditingRowId] = React.useState(null);
  const [editingValues, setEditingValues] = React.useState({});

  React.useEffect(() => {
    if (triggerRowAdd.value && editingRowId !== 0) {
      setEditingValues({});
      setEditingRowId(0);
    }
  }, [triggerRowAdd]);

  const collapsable = !!renderCollapse;

  const classes = useStyles({
    dense: dense || small,
    clickableRow: collapsable,
    small
  });

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
                disabled={disableAdd && disableAdd(editingValues)}
                onClick={() => {
                  onRowAdd(editingValues);
                  setEditingRowId(null);
                  afterRowAdd && afterRowAdd();
                }}
              >
                Créer
              </Button>
              <Button
                variant="outlined"
                color="primary"
                className={classes.cancelCreationButton}
                onClick={() => {
                  setEditingRowId(null);
                  afterRowAdd && afterRowAdd();
                }}
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
      <TableContainer className={` ${classes.tableContainer}`}>
        <MaterialTable
          stickyHeader={stickyHeader}
          className={`table ${classes.table}`}
          size={dense ? "small" : "medium"}
        >
          <TableHead>
            <TableRow>
              {collapsable && <TableCell />}
              {columns.map(column => (
                <TableCell
                  key={column.name}
                  align={column.align || "left"}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
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
                <Row
                  key={entry.id || 0}
                  columns={columns}
                  entry={entry}
                  onFocus={onFocus}
                  isAddingRow={isAddingRow}
                  editingValues={editingValues}
                  setEditingValues={setEditingValues}
                  shouldDisplayEditActionsColumn={
                    shouldDisplayEditActionsColumn
                  }
                  renderEditActions={renderEditActions}
                  collapsable={collapsable}
                  rowClassName={classes.row}
                />
              );
            })}
          </TableBody>
        </MaterialTable>
      </TableContainer>
    </Box>
  );
}

const VirtualizedTable = React.forwardRef(
  (
    {
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
      onRowClick,
      scrollTop = null,
      autoHeight = false,
      rowClassName,
      rowRenderer = null,
      headerClassName
    },
    ref
  ) => {
    const minTableWidth =
      columns.reduce((acc, col) => {
        return acc + (col.minWidth || columnDefaultMinWidth);
      }, 0) + (shouldDisplayEditActionsColumn ? columnDefaultMinWidth : 0);
    return (
      <Table
        ref={ref}
        autoHeight={autoHeight}
        className={`table ${classes.table}`}
        width={Math.max(width, minTableWidth)}
        height={Math.max(height, minHeight)}
        headerHeight={headerHeight}
        rowCount={entries.length}
        rowGetter={({ index }) => entries[index]}
        rowRenderer={props =>
          rowRenderer ? rowRenderer(props) : defaultTableRowRenderer(props)
        }
        rowHeight={
          typeof rowHeight === "number"
            ? rowHeight
            : ({ index }) => rowHeight(index, entries[index])
        }
        rowClassName={({ index }) =>
          index >= 0
            ? `${classes.row} ${rowClassName &&
                rowClassName(index, entries[index])}`
            : `${classes.header} ${headerClassName ? headerClassName : ""}`
        }
        onScroll={onScroll}
        scrollTop={scrollTop}
        onRowClick={onRowClick}
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
                    <CellContent
                      cellData={cellData}
                      rowData={rowData}
                      onFocus={onFocus}
                      column={column}
                    />
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
);

export const AugmentedVirtualizedTable = React.forwardRef(
  (
    {
      columns,
      entries,
      onRowEdit,
      onRowClick = null,
      onRowAdd,
      triggerRowAdd = { value: false },
      onRowDelete,
      dense = false,
      defaultSortBy = undefined,
      defaultSortType = "asc",
      headerHeight = 60,
      rowHeight = 40,
      minHeight = 0,
      maxHeight = "100%",
      columnDefaultBaseWidth = 200,
      columnDefaultMinWidth = 200,
      className = "",
      attachScrollTo = null,
      rowClassName = () => "",
      rowRenderer = null,
      headerClassName,
      small
    },
    ref
  ) => {
    const [sortBy, setSortBy] = React.useState(defaultSortBy);
    const [sortType, setSortType] = React.useState(
      defaultSortBy ? defaultSortType : undefined
    );

    const [editingRowId, setEditingRowId] = React.useState(null);
    const [editingValues, setEditingValues] = React.useState({});

    const classes = useStyles({ dense, clickableRow: !!onRowClick, small });

    React.useEffect(() => {
      if (triggerRowAdd.value && editingRowId !== 0) {
        setEditingValues({});
        setEditingRowId(0);
      }
    }, [triggerRowAdd]);

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
        <TableContainer
          style={{
            height:
              Math.max(
                (typeof rowHeight === "number"
                  ? displayedEntries.length * rowHeight
                  : sum(
                      displayedEntries.map((entry, index) =>
                        rowHeight(index, entry)
                      )
                    )) + headerHeight,
                minHeight
              ) + 2,
            maxHeight,
            overflowY: "hidden",
            marginBottom: 1
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
                        ref={ref}
                        columns={columns}
                        entries={displayedEntries}
                        classes={classes}
                        width={width}
                        height={height - 2}
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
                        onRowClick={onRowClick}
                        rowClassName={rowClassName}
                        rowRenderer={rowRenderer}
                        headerClassName={headerClassName}
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
                    height={height - 2}
                    ref={ref}
                    minHeight={minHeight}
                    headerHeight={headerHeight}
                    rowHeight={rowHeight}
                    onRowClick={onRowClick}
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
                    rowClassName={rowClassName}
                    rowRenderer={rowRenderer}
                    headerClassName={headerClassName}
                  />
                );
              }}
            </AutoSizer>
          )}
        </TableContainer>
      </Box>
    );
  }
);
