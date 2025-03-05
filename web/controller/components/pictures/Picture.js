import React from "react";
import { makeStyles } from "@mui/styles";
import { cx } from "@codegouvfr/react-dsfr/fr/cx";

const useStyles = makeStyles(() => ({
  imageContainer: ({ width, height }) => ({
    width,
    height,
    position: "relative"
  }),
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  icon: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 500
  }
}));

const Picture = ({
  className,
  src,
  icon,
  alt = "",
  width = "100px",
  height = "100px",
  classes = {}
}) => {
  const style = useStyles({ width, height });

  const iconComponent = icon
    ? React.cloneElement(icon, {
        className: cx(style.icon, icon.props.className)
      })
    : null;

  return (
    <div className={cx(style.imageContainer, classes.root, className)}>
      {iconComponent}
      <img className={cx(style.image, classes.image)} src={src} alt={alt} />
    </div>
  );
};

export default Picture;
