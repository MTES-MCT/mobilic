import React, { Fragment } from "react";
import orderBy from "lodash/orderBy";
import forEach from "lodash/forEach";
import sum from "lodash/sum";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import TableContainer from "@mui/material/TableContainer";
import MaterialTable from "@mui/material/Table";
import { Table, AutoSizer, Column, WindowScroller } from "react-virtualized";
import "react-virtualized/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CircularProgress from "@mui/material/CircularProgress";
import { AugmentedTableHeaderCellContent } from "./AugmentedTableHeaderCellContent";
import {
  AugmentedTableRow,
  AugmentedTableRowCellContent
} from "./AugmentedTableRow";
import { AugmentedTableEditActions } from "./AugmentedTableEditActions";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { get } from "lodash";

const overflowStyleForMaxWidthCells = {
  overflowX: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const VIRTUALIZED_TABLE_COLUMN_DEFAULT_MIN_WIDTH = 200;
const VIRTUALIZED_TABLE_COLUMN_DEFAULT_BASE_WIDTH = 200;
const DEFAULT_INTER_GROUP_ROW_HEIGHT = 20;

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
      background: "#fafbfc"
    },
    borderTop: "0.5px solid #ebeff3",
    "&:first-child": {
      borderTop: "none"
    },
    "&:focus": {
      outline: "none"
    }
  },
  clickableRow: {
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#b4e1fa"
    }
  },
  interGroupRow: {
    height: ({ interGroupRowHeight }) => interGroupRowHeight
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
    margin: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: ({ dense }) => (dense ? theme.spacing(0.5) : theme.spacing(2)),
    paddingBottom: ({ dense }) =>
      dense ? theme.spacing(0.5) : theme.spacing(2)
  },
  groupRow: {
    color: theme.palette.primary.main,
    borderTop: "none",
    borderBottom: "solid 1px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  collapsed: { height: 0, display: "none" }
}));

export const AugmentedTable = React.forwardRef(
  (
    {
      columns: actualColumns,
      entries,
      onRowEdit,
      onRowAdd,
      triggerRowAdd = { value: false },
      onRowDelete,
      dense = false,
      small = false,
      defaultSortBy = undefined,
      defaultSortType = "asc",
      onRowGroupClick = null,
      disableGroupCollapse = false,
      onRowClick = null,
      alwaysSortBy = [],
      customRowActions = null,
      groupByColumn = null,
      className = "",
      validateRow = null,
      loading = false,
      rowClassName = null,
      headerClassName = null,
      virtualized,
      virtualizedHeaderHeight = 60,
      virtualizedRowHeight = 40,
      virtualizedMinHeight = 0,
      virtualizedMaxHeight = "100%",
      virtualizedAttachScrollTo = null,
      renderRow = null,
      editActionsColumnMinWidth = 70,
      forceParentUpdateOnRowAdd = null,
      groupKeysToShow = null,
      onScroll,
      interGroupRowHeight = DEFAULT_INTER_GROUP_ROW_HEIGHT
    },
    ref
  ) => {
    const [sortBy, setSortBy] = React.useState(defaultSortBy);
    const [sortType, setSortType] = React.useState(
      defaultSortBy ? defaultSortType : undefined
    );

    const tableRef = React.useRef();

    const [editedRowId, setEditedRowId] = React.useState(null);
    const [editedValues, setEditedValues] = React.useState({});

    const [collapsedGroups, setCollapsedGroups] = React.useState([]);

    const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState(null);
    const [entryActedOn, setEntryActedOn] = React.useState(null);

    function onCustomActionsClick(e, entry) {
      setActionMenuAnchorEl(e.currentTarget);
      setEntryActedOn(entry);
    }

    function handleCustomActionsClose() {
      setActionMenuAnchorEl(null);
      setEntryActedOn(null);
    }

    const toggleCollapseColumn = {
      name: "__toggleCollapse",
      align: "center",
      format: (value, entry) =>
        entry.__groupKey ? (
          <IconButton size="small" color="inherit">
            {entry.__collapsedGroup ? (
              <KeyboardArrowRightIcon fontSize="inherit" />
            ) : (
              <KeyboardArrowDownIcon fontSize="inherit" />
            )}
          </IconButton>
        ) : null,
      baseWidth: 30,
      minWidth: 30,
      flexGrow: 0,
      flexShrink: 0
    };

    const isCurrentlyAddingRow = editedRowId === 0;
    const isCurrentlyEditingRow = !!editedRowId;
    const shouldDisplayEditActionsColumn = Boolean(
      !!onRowEdit ||
        isCurrentlyAddingRow ||
        !!onRowDelete ||
        isCurrentlyEditingRow ||
        customRowActions
    );

    const editActionsColumn = {
      name: "edit",
      align: "right",
      create: true,
      edit: true,
      format: (value, entry) => renderEditActions({ entry, columns }),
      renderEditMode: (value, entry, _, isAddingRow) =>
        renderEditActions({
          entry,
          columns,
          isAddingRow,
          isEditingRow: !isAddingRow
        }),
      baseWidth: editActionsColumnMinWidth,
      minWidth: editActionsColumnMinWidth
    };

    let columns = [];
    if (groupByColumn && !disableGroupCollapse) {
      columns.push(toggleCollapseColumn);
    }
    columns.push(...actualColumns);
    if (shouldDisplayEditActionsColumn) columns.push(editActionsColumn);

    function initNewRow(params) {
      if (
        editedRowId !== 0 ||
        (groupByColumn &&
          params[groupByColumn.name] !== editedValues[groupByColumn.name])
      ) {
        setEditedValues({ ...params, __adding: true } || { __adding: true });
        setEditedRowId(0);
      }
    }

    React.useEffect(() => {
      if (forceParentUpdateOnRowAdd) {
        if (editedRowId === 0 || editedRowId === null)
          forceParentUpdateOnRowAdd();
      }
    }, [editedRowId]);

    React.useImperativeHandle(ref, () => ({
      newRow: initNewRow,
      isAddingRow: () => isCurrentlyAddingRow,
      updateScrollPosition: () =>
        tableRef.current &&
        tableRef.current.updateScrollPosition &&
        tableRef.current.updateScrollPosition()
    }));

    const onToggleCollapseGroup = groupKey => {
      setCollapsedGroups(cGroups =>
        cGroups.includes(groupKey)
          ? cGroups.filter(g => g !== groupKey)
          : [...cGroups, groupKey]
      );
    };

    const classes = useStyles({
      dense: dense || small,
      interGroupRowHeight,
      small
    });

    const handleSortTypeChange = column => () => {
      let newSortType = "desc";
      if (sortBy === column && sortType === "desc") newSortType = "asc";
      setSortBy(column);
      setSortType(newSortType);
    };

    function renderEditActions({ entry, isAddingRow, isEditingRow, columns }) {
      return (
        <AugmentedTableEditActions
          entry={entry}
          columns={columns}
          isAddingRow={isAddingRow}
          isEditingRow={isEditingRow}
          onCustomActionsClick={customRowActions ? onCustomActionsClick : null}
          onRowAdd={onRowAdd}
          onRowEdit={onRowEdit}
          onRowDelete={onRowDelete}
          onStartRowEdit={() => {
            setEditedRowId(entry.id);
          }}
          onTerminateRowEdit={() => setEditedRowId(null)}
          editedValues={editedValues}
          setEditedValues={setEditedValues}
          validateRow={validateRow}
        />
      );
    }

    function columnEditor(columnName) {
      return value =>
        setEditedValues(values => ({
          ...values,
          [columnName]: value
        }));
    }

    function isEditingRow(entry) {
      return isCurrentlyEditingRow && editedRowId === entry.id;
    }

    function isAddingRow(entry) {
      return isCurrentlyAddingRow && entry.__adding;
    }

    function renderCell(entry, column, isAddingRow, isEditingRow) {
      return (
        <AugmentedTableRowCellContent
          cellData={entry[column.name]}
          rowData={entry}
          column={column}
          setCellData={columnEditor(column.name)}
          adding={isAddingRow && (column.create || column.edit)}
          editing={isEditingRow && column.edit}
        />
      );
    }

    function renderHeaderCell(column) {
      return (
        <AugmentedTableHeaderCellContent
          column={column}
          onSortTypeChange={handleSortTypeChange}
          sorted={sortBy === (column.propertyForSorting || column.name)}
          desc={sortType}
        />
      );
    }

    function renderGroupHeaderRow({ groupKey, entry, columns, renderColumn }) {
      const collapseColumnIndex = columns.findIndex(
        c => c.name === "__toggleCollapse"
      );
      const columnsToRender = columns.slice(0, collapseColumnIndex + 1);

      return [
        ...columnsToRender.map(renderColumn),
        virtualized ? (
          <Box
            key="groupBy"
            className={classes.cell}
            style={{ textAlign: "left", fontWeight: "bold", flexGrow: 100 }}
          >
            {groupByColumn.format(groupKey, entry)}
          </Box>
        ) : (
          <TableCell
            align="left"
            colSpan="100"
            className={classes.cell}
            style={{ fontWeight: "bold" }}
            key="groupBy"
          >
            {groupByColumn.format(groupKey, entry)}
          </TableCell>
        )
      ];
    }

    function actualRenderRow({
      entry,
      columns,
      renderColumn,
      isAddingRow,
      isEditingRow
    }) {
      if (renderRow) {
        const renderAttempt = renderRow({
          entry,
          columns,
          renderColumn,
          isAddingRow,
          isEditingRow,
          startRowEdit: () => setEditedRowId(entry.id),
          terminateRowEdit: () => setEditedRowId(null)
        });
        if (renderAttempt !== undefined) return renderAttempt;
      }
      if (entry.__groupKey)
        return renderGroupHeaderRow({
          groupKey: entry.__groupKey,
          entry,
          columns,
          renderColumn
        });
      if (entry.__endOfGroup) return null;
      return columns.map(renderColumn);
    }

    function rowClassNameFunc(entry) {
      let baseClassName = "";
      if (rowClassName) {
        if (typeof rowClassName === "string") {
          baseClassName = rowClassName;
        } else baseClassName = rowClassName(entry);
      }
      return `${baseClassName} ${
        entry.__endOfGroup ? classes.interGroupRow : ""
      } ${entry.__groupKey ? `${classes.groupRow}` : ""} ${
        isRowCollapsed(entry) ? classes.collapsed : ""
      } ${entry.__collapsedGroup ? "__a__" : ""}`;
    }

    function rowId(entry) {
      return (
        entry.id ||
        (entry.__groupKey
          ? `group_${entry.__groupKey}`
          : entry.__endOfGroup
          ? `end_${entry.__endOfGroup}`
          : 0)
      );
    }

    let sortBys = [],
      sortTypes = [];
    if (groupByColumn && groupByColumn.sort) {
      sortBys.push(groupByColumn.name);
      sortTypes.push(groupByColumn.sort);
    }

    sortBys.push(...alwaysSortBy.map(asb => asb[0]));
    sortTypes.push(...alwaysSortBy.map(asb => asb[1]));

    if (sortBy && sortType) {
      sortBys.push(item =>
        get(item, sortBy)
          .toString()
          .toLowerCase()
      );
      sortTypes.push(sortType);
    }

    const sortedEntries =
      sortBys.length > 0 ? orderBy(entries, sortBys, sortTypes) : entries;

    let sortedEntriesWithGroups = [];
    const groupKeysInData = {};
    if (groupByColumn) {
      let currentGroupKey = null;
      sortedEntries.forEach(e => {
        const groupKey = e[groupByColumn.name];
        if (!currentGroupKey || groupKey !== currentGroupKey) {
          if (currentGroupKey && !collapsedGroups.includes(currentGroupKey))
            sortedEntriesWithGroups.push({
              __endOfGroup: `end_${currentGroupKey}`
            });
          const newGroupEntry = {
            id: groupKey,
            __groupKey: groupKey,
            __collapsedGroup: collapsedGroups.includes(groupKey)
          };
          if (groupByColumn.groupProps)
            groupByColumn.groupProps.forEach(
              prop => (newGroupEntry[prop] = e[prop])
            );
          groupKeysInData[groupKey] = true;
          sortedEntriesWithGroups.push(newGroupEntry);
          currentGroupKey = groupKey;
        }
        sortedEntriesWithGroups.push(e);
      });
    } else sortedEntriesWithGroups = sortedEntries;

    const additionalEntries = [];
    if (groupByColumn && groupKeysToShow) {
      forEach(groupKeysToShow, (params, gk) => {
        const gkWithCorrectType = parseInt(gk) || gk;
        if (!groupKeysInData[gk]) {
          const newEntry = {
            id: gkWithCorrectType,
            __groupKey: gkWithCorrectType,
            __collapsedGroup: false,
            ...params
          };
          additionalEntries.push(newEntry);
          additionalEntries.push({ __endOfGroup: `end_${gk}` });
        }
      });
    }

    const displayedEntries = [...additionalEntries, ...sortedEntriesWithGroups];

    if (isCurrentlyAddingRow) {
      if (groupByColumn) {
        const currentGroupUnderAddIndex = displayedEntries.findIndex(
          e => e.__groupKey === editedValues[groupByColumn.name]
        );
        displayedEntries.splice(currentGroupUnderAddIndex + 1, 0, editedValues);
      } else displayedEntries.splice(0, 0, editedValues);
    }

    const virtualizedRowHeightFunc = entry =>
      entry.__endOfGroup
        ? (groupByColumn && groupByColumn.interGroupHeight) ||
          DEFAULT_INTER_GROUP_ROW_HEIGHT
        : isRowCollapsed(entry)
        ? 0
        : typeof virtualizedRowHeight === "number"
        ? virtualizedRowHeight
        : virtualizedRowHeight(entry);

    const onRowClickFunc = entry => {
      if (entry.__groupKey) {
        if (onRowGroupClick) return () => onRowGroupClick(entry);
        if (!disableGroupCollapse)
          return () => onToggleCollapseGroup(entry.__groupKey);
        return null;
      }
      if (onRowClick) return () => onRowClick(entry);
      return null;
    };

    const isRowCollapsed = entry =>
      groupByColumn &&
      !entry.__groupKey &&
      !entry.__adding &&
      collapsedGroups.includes(entry[groupByColumn.name]);

    const virtualizedContainerStyle = {
      height:
        Math.max(
          sum(
            displayedEntries.map((entry, _) => virtualizedRowHeightFunc(entry))
          ) + virtualizedHeaderHeight,
          virtualizedMinHeight
        ) + 34,
      maxHeight: virtualizedMaxHeight,
      marginBottom: 1,
      overflowY: "hidden"
    };

    const props = {
      columns,
      entries: displayedEntries,
      renderRow: actualRenderRow,
      isEditingRow,
      isAddingRow,
      editedValues,
      renderHeaderCell,
      renderCell,
      ref: tableRef,
      rowId,
      dense,
      headerClassName,
      loading,
      rowClassName: rowClassNameFunc,
      classes,
      onRowClick: onRowClickFunc,
      onScroll: onScroll
    };

    return (
      <Box className={`${className} ${virtualized && "flex-column"}`}>
        <TableContainer
          className={` ${classes.tableContainer}`}
          style={virtualized && virtualizedContainerStyle}
        >
          <CircularProgress
            style={{
              position: "absolute",
              top: virtualized ? virtualizedHeaderHeight : 60,
              visibility: loading ? "visible" : "hidden",
              zIndex: 9999
            }}
            color="primary"
          />
          {virtualized ? (
            <VirtualizedTable
              {...props}
              minHeight={virtualizedMinHeight}
              maxHeight={virtualizedMaxHeight}
              headerHeight={virtualizedHeaderHeight}
              rowHeight={virtualizedRowHeightFunc}
              attachScrollTo={virtualizedAttachScrollTo}
            />
          ) : (
            <MaterialUITable {...props} />
          )}
        </TableContainer>
        {customRowActions && (
          <Menu
            key={6}
            keepMounted
            open={Boolean(actionMenuAnchorEl)}
            onClose={handleCustomActionsClose}
            anchorEl={actionMenuAnchorEl}
          >
            {customRowActions(entryActedOn).map(cra => (
              <MenuItem
                key={cra.name}
                disabled={cra.disabled}
                onClick={async () => {
                  await cra.action(entryActedOn);
                  handleCustomActionsClose();
                }}
              >
                {cra.label}
              </MenuItem>
            ))}
          </Menu>
        )}
      </Box>
    );
  }
);

const MaterialUITable = React.forwardRef(
  (
    {
      columns,
      entries,
      isEditingRow,
      isAddingRow,
      editedValues,
      renderHeaderCell,
      renderRow,
      renderCell,
      dense = false,
      classes,
      rowClassName,
      headerClassName,
      onRowClick = null,
      loading = false,
      rowId
    },
    ref
  ) => {
    return (
      <MaterialTable
        stickyHeader={false}
        className={`table ${classes.table}`}
        size={dense ? "small" : "medium"}
        style={{ filter: loading ? "blur(5px)" : "none" }}
      >
        <TableHead>
          <TableRow
            className={`${classes.header} ${
              headerClassName ? headerClassName : ""
            }`}
          >
            {columns.map(column => (
              <TableCell
                key={column.name}
                align={column.align || "left"}
                style={{
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth
                }}
              >
                {renderHeaderCell(column)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => {
            const id = rowId(entry);
            const isRowUnderEdit = isEditingRow(entry);
            const isRowBeingAdded = isAddingRow(entry);
            const onRowClickFunc = onRowClick(entry);

            return (
              <AugmentedTableRow
                key={id}
                columns={columns}
                entry={
                  isRowUnderEdit || isRowBeingAdded
                    ? { ...entry, ...editedValues }
                    : entry
                }
                isAddingRow={isRowBeingAdded}
                isEditingRow={isRowUnderEdit}
                rowClassName={`${classes.row} ${
                  onRowClickFunc && !entry.__groupKey && !entry.__endOfGroup
                    ? classes.clickableRow
                    : ""
                } ${rowClassName(entry)}`}
                renderCell={renderCell}
                renderRow={renderRow}
                renderRowContainer={props => <TableRow hover {...props} />}
                renderCellContainer={(column, children) => {
                  let cellStyle = {
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  };
                  if (column.maxWidth)
                    cellStyle = {
                      ...cellStyle,
                      ...overflowStyleForMaxWidthCells
                    };
                  return (
                    <TableCell
                      key={column.name}
                      align={column.align || "left"}
                      style={cellStyle}
                    >
                      {children}
                    </TableCell>
                  );
                }}
                onRowClick={onRowClickFunc}
              />
            );
          })}
        </TableBody>
      </MaterialTable>
    );
  }
);

const _VirtualizedTable = React.forwardRef(
  (
    {
      columns,
      entries,
      isAddingRow,
      isEditingRow,
      editedValues,
      renderHeaderCell,
      renderCell,
      rowClassName,
      headerClassName,
      onRowClick,
      renderRow = null,
      classes,
      width,
      height,
      minHeight,
      headerHeight,
      rowHeightFunc,
      onScroll = () => {},
      onScrollAction = () => {},
      scrollTop = null,
      autoHeight = false,
      rowId
    },
    ref
  ) => {
    let actualRef = ref || React.useRef();

    const minTableWidth = columns.reduce((acc, col) => {
      return (
        acc + 10 + (col.minWidth || VIRTUALIZED_TABLE_COLUMN_DEFAULT_MIN_WIDTH)
      );
    }, 0);
    const actualHeight = Math.max(height, minHeight);
    return (
      <Table
        ref={actualRef}
        autoHeight={autoHeight}
        className={`table ${classes.table}`}
        width={Math.max(width, minTableWidth)}
        height={actualHeight}
        headerHeight={headerHeight}
        rowCount={entries.length}
        rowGetter={({ index }) => entries[index]}
        rowRenderer={props => {
          function renderCellContainer(column) {
            const columnIndex = columns.findIndex(c => c.name === column.name);
            return props.columns[columnIndex];
          }

          const isRowUnderEdit = isEditingRow(props.rowData);
          const isRowBeingAdded = isAddingRow(props.rowData);
          const onRowClickFunc = onRowClick(props.rowData);

          return (
            <AugmentedTableRow
              key={props.key}
              columns={columns}
              entry={
                isRowUnderEdit || isRowBeingAdded
                  ? { ...props.rowData, ...editedValues }
                  : props.rowData
              }
              isAddingRow={isRowBeingAdded}
              isEditingRow={isRowUnderEdit}
              rowClassName={props.className}
              renderCell={renderCell}
              renderRow={renderRow}
              renderRowContainer={propss => (
                <Box role="row" style={props.style} {...propss} />
              )}
              renderCellContainer={renderCellContainer}
              onRowClick={onRowClickFunc}
            />
          );
        }}
        rowHeight={({ index }) => rowHeightFunc(entries[index])}
        rowClassName={({ index }) =>
          index >= 0
            ? `${classes.row} ${
                onRowClick(entries[index]) &&
                !entries[index].__groupKey &&
                !entries[index].__endOfGroup
                  ? classes.clickableRow
                  : ""
              } ${rowClassName && rowClassName(entries[index])}`
            : `${classes.header} ${headerClassName ? headerClassName : ""}`
        }
        onScroll={args => {
          onScroll(args);
          onScrollAction(args);
        }}
        scrollTop={scrollTop}
        onRowClick={({ rowData }) => onRowClick(rowData)()}
      >
        {columns.map(column => {
          return (
            <Column
              key={column.name}
              flexGrow={column.flexGrow !== undefined ? column.flexGrow : 1}
              flexShrink={
                column.flexShrink !== undefined ? column.flexShrink : 1
              }
              dataKey={column.name}
              className={`${classes.cell} ${column.className || ""}`}
              headerClassName={`${classes.cell} ${column.className || ""}`}
              cellDataGetter={({ rowData, dataKey }) => {
                return rowData[dataKey];
              }}
              cellRenderer={({ rowData, cellData, rowIndex }) =>
                renderCell(
                  rowData,
                  column,
                  isAddingRow(rowData),
                  isEditingRow(rowData)
                )
              }
              style={{ textAlign: column.align }}
              headerStyle={{ textAlign: column.align }}
              headerRenderer={() => renderHeaderCell(column)}
              width={
                column.baseWidth || VIRTUALIZED_TABLE_COLUMN_DEFAULT_BASE_WIDTH
              }
              minWidth={
                column.minWidth || VIRTUALIZED_TABLE_COLUMN_DEFAULT_MIN_WIDTH
              }
            />
          );
        })}
      </Table>
    );
  }
);

const VirtualizedTable = React.forwardRef(
  (
    {
      columns,
      entries,
      onRowClick = null,
      isAddingRow,
      isEditingRow,
      editedValues,
      dense = false,
      headerHeight = 60,
      rowHeight,
      minHeight = 0,
      maxHeight = "100%",
      attachScrollTo = null,
      rowClassName = () => "",
      renderRow = null,
      renderCell,
      renderHeaderCell,
      headerClassName,
      loading,
      classes,
      onScroll = () => {},
      rowId
    },
    ref
  ) => {
    const scrollerRef = React.useRef();

    React.useImperativeHandle(ref, () => ({
      updateScrollPosition: () =>
        scrollerRef.current &&
        scrollerRef.current.updatePosition &&
        scrollerRef.current.updatePosition()
    }));

    const key = React.useMemo(() => `table__${entries.length}`, [entries]);

    return (
      <Fragment key={key}>
        {attachScrollTo ? (
          <WindowScroller ref={scrollerRef} scrollElement={attachScrollTo}>
            {({ height, registerChild, onChildScroll, scrollTop }) => (
              <AutoSizer
                disableHeight
                style={{ filter: loading ? "blur(5px)" : "none" }}
              >
                {({ width }) => (
                  <div ref={registerChild}>
                    <_VirtualizedTable
                      ref={ref}
                      columns={columns}
                      entries={entries}
                      classes={classes}
                      width={width}
                      height={height}
                      minHeight={minHeight}
                      headerHeight={headerHeight}
                      rowHeightFunc={rowHeight}
                      isAddingRow={isAddingRow}
                      isEditingRow={isEditingRow}
                      renderHeaderCell={renderHeaderCell}
                      editedValues={editedValues}
                      onScroll={onChildScroll}
                      onScrollAction={() => {
                        onScroll();
                      }}
                      scrollTop={scrollTop}
                      autoHeight={true}
                      onRowClick={onRowClick}
                      rowClassName={rowClassName}
                      renderRow={renderRow}
                      headerClassName={headerClassName}
                      renderCell={renderCell}
                      rowId={rowId}
                    />
                  </div>
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        ) : (
          <AutoSizer style={{ filter: loading ? "blur(5px)" : "none" }}>
            {({ width, height }) => {
              return (
                <_VirtualizedTable
                  ref={ref}
                  columns={columns}
                  entries={entries}
                  classes={classes}
                  width={width}
                  height={height}
                  minHeight={minHeight}
                  headerHeight={headerHeight}
                  rowHeightFunc={rowHeight}
                  isAddingRow={isAddingRow}
                  isEditingRow={isEditingRow}
                  renderHeaderCell={renderHeaderCell}
                  editedValues={editedValues}
                  onRowClick={onRowClick}
                  rowClassName={rowClassName}
                  renderRow={renderRow}
                  headerClassName={headerClassName}
                  renderCell={renderCell}
                  rowId={rowId}
                />
              );
            }}
          </AutoSizer>
        )}
      </Fragment>
    );
  }
);
