import React from "react";
import {Container} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {ScrollPicker} from "../components/ScrollPicker";


const tabs = {
    day: {
        screen: (props) => null,
        label: "Jour",
        value: "day"
    },
    week: {
        screen: (props) => null,
        label: "Semaine",
        value: "week"
    }
};


export function History () {
    const [tab, setTab] = React.useState("day");
    const [value, setValue] = React.useState(1);
    return (
        <Container className="container">
            <AppBar>
              <Toolbar className="app-header stretch-header-content" disableGutters>
                  <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} style={{flexGrow: 1}}>
                      {Object.values(tabs).map((tabProps) => (
                          <Tab label={tabProps.label} value={tabProps.value} style={{flexGrow: 1}} />
                      ))}
                  </Tabs>
              </Toolbar>
            </AppBar>
            <AppBar style={{position: "relative", visibility: "hidden"}}><Toolbar/></AppBar>
            <ScrollPicker
                name="day"
                values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                value={value}
                setValue={setValue}
                height="100px"
            />
        </Container>
    );
}