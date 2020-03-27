import React from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Select from "@material-ui/core/Select";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName } from "../../common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import { OutlinedInput } from "@material-ui/core";
import { DataFilter } from "./DataFilter";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    width: 300
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300
    }
  }
};

export function EmployeeFilter({ users, setUsers }) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleChange = event => {
    const selectedIds = event.target.value.map(u => u.id);
    setUsers(
      users.map(u => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const reset = () => {
    setUsers(users.map(u => ({ ...u, selected: false })));
  };

  const selectedUsers = users.filter(user => user.selected);
  const isActive = selectedUsers.length > 0;
  return (
    <DataFilter reset={reset} isActive={isActive}>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel>Employés</InputLabel>
        <Select
          multiple
          value={selectedUsers}
          onChange={handleChange}
          open={open}
          onClick={e => {
            setOpen(!open);
          }}
          renderValue={people => (
            <Box className={classes.chips}>
              {people
                .filter(p => p.selected)
                .map(person => (
                  <Chip
                    key={person.id}
                    label={formatPersonName(person)}
                    className={classes.chip}
                    onDelete={e => {
                      e.stopPropagation();
                      setUsers(
                        users.map(u =>
                          u.id === person.id ? { ...u, selected: false } : u
                        )
                      );
                    }}
                  />
                ))}
            </Box>
          )}
          input={<OutlinedInput label="Employés" />}
          MenuProps={MenuProps}
        >
          {users.map(user => (
            <Box key={user.id}>
              <MenuItem
                selected={user.selected || false}
                onClick={e => {
                  e.stopPropagation();
                  setUsers(
                    users.map(u =>
                      u.id === user.id ? { ...u, selected: !user.selected } : u
                    )
                  );
                }}
              >
                <Typography
                  variant="body1"
                  className={user.selected ? "bold" : ""}
                >
                  {formatPersonName(user)}
                </Typography>
              </MenuItem>
            </Box>
          ))}
        </Select>
      </FormControl>
    </DataFilter>
  );
}
