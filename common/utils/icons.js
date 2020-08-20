import SvgIcon from "@material-ui/core/SvgIcon";
import React from "react";
import omit from "lodash/omit";
import { ReactComponent as PersonIcon_ } from "../assets/images/User.svg";
import { ReactComponent as TeamIcon_ } from "../assets/images/Team.svg";
import { ReactComponent as TruckIcon_ } from "../assets/images/Truck.svg";
import { ReactComponent as HammerWenchIcon_ } from "../assets/images/Hammer Wench.svg";
import { ReactComponent as BedIcon_ } from "../assets/images/Bed.svg";
import { ReactComponent as ManagerIcon_ } from "../assets/images/Manager.svg";
import { ReactComponent as FranceConnectIcon_ } from "../assets/images/FranceConnect.svg";

export function PersonIcon(props) {
  return <SvgIcon {...props} viewBox="0 0 64 64" component={PersonIcon_} />;
}

export function TeamIcon(props) {
  return <SvgIcon {...props} viewBox="0 0 64 64" component={TeamIcon_} />;
}

export function TruckIcon(props) {
  return <SvgIcon {...props} viewBox="0 0 64 64" component={TruckIcon_} />;
}

export function WorkIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 64 64" component={HammerWenchIcon_} />
  );
}

export function RestIcon(props) {
  return <SvgIcon {...props} viewBox="0 0 64 64" component={BedIcon_} />;
}

export function ManagerIcon(props) {
  return <SvgIcon {...props} viewBox="0 0 100 100" component={ManagerIcon_} />;
}

export function FranceConnectIcon(props) {
  return (
    <SvgIcon
      style={{
        width: 283 * (props.scale ? props.scale : 1),
        height: 82 * (props.scale ? props.scale : 1),
        ...props.style
      }}
      {...omit(props, "style")}
      viewBox="0 0 283.5 82.2"
      component={FranceConnectIcon_}
    />
  );
}
