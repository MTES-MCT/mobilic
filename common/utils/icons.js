import SvgIcon from "@mui/material/SvgIcon";
import React from "react";
import { ReactComponent as MobilicFilledIcon_ } from "../assets/images/mobilic-logo-filled.svg";
import { ReactComponent as MobilicOutlinedIcon_ } from "../assets/images/mobilic-logo-outlined.svg";
import { ReactComponent as MobilicBlueIcon_ } from "../assets/images/mobilic-logo-blue.svg";
import { ReactComponent as PersonIcon_ } from "../assets/images/User.svg";
import { ReactComponent as TeamIcon_ } from "../assets/images/Team.svg";
import { ReactComponent as TruckIcon_ } from "../assets/images/Truck2.svg";
import { ReactComponent as HammerWenchIcon_ } from "../assets/images/Work.svg";
import { ReactComponent as TrainIcon_ } from "../assets/images/Train.svg";
import { ReactComponent as BedIcon_ } from "../assets/images/Bed2.svg";
import { ReactComponent as MarianneIcon_ } from "common/assets/images/marianne.svg";
import _ManagerImage from "../assets/images/Manager.svg";
import _WorkerImage from "../assets/images/worker.svg";
import _SoftwareImage from "../assets/images/software.svg";
import _ControllerImage from "../assets/images/controller1.png";
import _MobilicQrCode from "../assets/images/mobilic-qrcode.svg";
import _NoDataImage from "../assets/images/no-data.png";
import _AxecImage from "../assets/images/press-logos/axec.png";
import _ActuTransportLogistiqueImage from "../assets/images/press-logos/actuTransportLogistique.png";
import _EcoLogisticsImage from "../assets/images/press-logos/ecologistics.jpg";
import _FlottesAutomobilesImage from "../assets/images/press-logos/flottes-automobiles.jpg";
import _HubInstituteImage from "../assets/images/press-logos/hubInstitute.png";
import _RadioSupplyChainImage from "../assets/images/press-logos/radio_supply_chain.png";
import _SupplyChainVillageImage from "../assets/images/press-logos/supply_chain_village.jpg";
import _VirImage from "../assets/images/testimonials-logos/vir.jpg";
import _AlexisDemenagementImage from "../assets/images/testimonials-logos/alexis_plus.jpg";
import _BretagneMaceDemenagementImage from "../assets/images/testimonials-logos/bretagne_mace_demenagement.jpg";
import _CertificationSquareBronze from "../assets/images/certification/squared/bronze.png";
import _CertificationSquareArgent from "../assets/images/certification/squared/argent.png";
import _CertificationSquareOr from "../assets/images/certification/squared/or.png";
import _CertificationSquareDiamant from "../assets/images/certification/squared/diamant.png";
import _ComputerImage from "../assets/images/computer.png";
import DateRangeIcon from "@mui/icons-material/DateRange";

export function MobilicLogoFilledIcon(props) {
  return (
    <SvgIcon
      titleAccess={"mobilic-filled"}
      {...props}
      viewBox="0 0 255.27 297.23"
      component={MobilicFilledIcon_}
    />
  );
}

export function MobilicLogoBlueIcon(props) {
  return (
    <SvgIcon
      titleAccess={"mobilic-logo-blue"}
      {...props}
      viewBox="0 0 48 57"
      component={MobilicBlueIcon_}
    />
  );
}

export function MobilicLogoOutlinedIcon(props) {
  return (
    <SvgIcon
      titleAccess={"mobilic-outlined"}
      {...props}
      viewBox="-5 -5 265.27 310"
      component={MobilicOutlinedIcon_}
    />
  );
}

export function PersonIcon(props) {
  return (
    <SvgIcon
      titleAccess="solo"
      {...props}
      viewBox="0 0 64 64"
      component={PersonIcon_}
    />
  );
}

export function TeamIcon(props) {
  return (
    <SvgIcon
      titleAccess="équipe"
      {...props}
      viewBox="0 0 64 64"
      component={TeamIcon_}
    />
  );
}

export function TruckIcon(props) {
  return (
    <SvgIcon
      titleAccess="déplacement"
      {...props}
      viewBox="0 0 246.14 157.79"
      component={TruckIcon_}
    />
  );
}

export function TransferIcon(props) {
  return (
    <SvgIcon
      titleAccess="temps de liaison"
      {...props}
      viewBox="-1 -1 22 23"
      component={TrainIcon_}
    />
  );
}

export function HolidayIcon(props) {
  return <DateRangeIcon {...props} />;
}

export function WorkIcon(props) {
  return (
    <SvgIcon
      titleAccess="autre tâche"
      {...props}
      viewBox="0 0 189.57 153.6"
      component={HammerWenchIcon_}
    />
  );
}

export function RestIcon(props) {
  return (
    <SvgIcon
      titleAccess="pause"
      {...props}
      viewBox="0 0 166.12 185.92"
      component={BedIcon_}
    />
  );
}

export function MarianneIcon(props) {
  return (
    <SvgIcon
      titleAccess="marianne"
      {...props}
      viewBox="0 0 130 115"
      component={MarianneIcon_}
    />
  );
}

export function NoDataImage(props) {
  return <img alt="pas de données" src={_NoDataImage} {...props} />;
}

export function ManagerImage(props) {
  return <img alt="" src={_ManagerImage} {...props} />;
}

export function WorkerImage(props) {
  return <img alt="" src={_WorkerImage} {...props} />;
}

export function SoftwareImage(props) {
  return <img alt="" src={_SoftwareImage} {...props} />;
}

export function ControllerImage(props) {
  return <img alt="" src={_ControllerImage} {...props} />;
}

export function AxecImage(props) {
  return <img alt="AXEC" src={_AxecImage} {...props} />;
}

export function ActuTransportLogistiqueImage(props) {
  return (
    <img
      alt="Actu Transport Logistique"
      src={_ActuTransportLogistiqueImage}
      {...props}
    />
  );
}

export function EcoLogisticsImage(props) {
  return <img alt="Eco Logistique" src={_EcoLogisticsImage} {...props} />;
}

export function FlottesAutomobilesImage(props) {
  return (
    <img alt="Flottes Automobiles" src={_FlottesAutomobilesImage} {...props} />
  );
}

export function HubInstituteImage(props) {
  return <img alt="Hub Institute" src={_HubInstituteImage} {...props} />;
}

export function RadioSupplyChainImage(props) {
  return (
    <img alt="Radio Supply Chain" src={_RadioSupplyChainImage} {...props} />
  );
}

export function SupplyChainVillageImage(props) {
  return (
    <img alt="Supply Chain Village" src={_SupplyChainVillageImage} {...props} />
  );
}

export function VirImage(props) {
  return <img alt="Vir" src={_VirImage} {...props} />;
}

export function AlexisDemenagementImage(props) {
  return (
    <img alt="Alexis Déménagement" src={_AlexisDemenagementImage} {...props} />
  );
}

export function BretagneMaceDemenagementImage(props) {
  return (
    <img
      alt="Bretagne Macé Déménagement"
      src={_BretagneMaceDemenagementImage}
      {...props}
    />
  );
}

export function ComputerImage(props) {
  return <img alt="Un ordinateur" src={_ComputerImage} {...props} />;
}

export function MobilicQrCode(props) {
  return <img alt="Mobilic" src={_MobilicQrCode} {...props} />;
}

export function CertificationBronze(props) {
  return <img alt="Certificat" src={_CertificationSquareBronze} {...props} />;
}

export function CertificationArgent(props) {
  return <img alt="Certificat" src={_CertificationSquareArgent} {...props} />;
}

export function CertificationOr(props) {
  return <img alt="Certificat" src={_CertificationSquareOr} {...props} />;
}

export function CertificationDiamant(props) {
  return <img alt="Certificat" src={_CertificationSquareDiamant} {...props} />;
}
