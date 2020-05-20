import SvgIcon from "@material-ui/core/SvgIcon";
import React from "react";
import { ReactComponent as PersonIcon_ } from "../assets/images/User.svg";
import { ReactComponent as TeamIcon_ } from "../assets/images/Team.svg";
import { ReactComponent as TruckIcon_ } from "../assets/images/Truck.svg";
import { ReactComponent as HammerWenchIcon_ } from "../assets/images/Hammer Wench.svg";
import { ReactComponent as BedIcon_ } from "../assets/images/Bed.svg";

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
