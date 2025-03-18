import React, { useEffect, useRef, useState } from "react";
import { Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ControlPicturesReview } from "./ControlPicturesReview";
import { TakePictureButton } from "./TakePictureButton";
import Picture from "./Picture";
import { useSnackbarAlerts } from "../../../common/Snackbar";

const useStyles = makeStyles(theme => ({
  pictureContainer: {
    position: "absolute",
    bottom: 24,
    left: 24
  },
  image: {
    borderRadius: "4px",
    border: "1px solid white"
  },
  nbPictures: {
    display: "inline-flex",
    whiteSpace: "pre",
    borderRadius: "100px",
    color: "white",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    height: theme.spacing(3),
    minWidth: theme.spacing(3),
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "0.75rem",
    position: "absolute",
    top: "-10%",
    right: "-10%",
    background: theme.palette.primary.main,
    zIndex: 500
  }
}));

export function ControlTakePictures({ onClose }) {
  const classes = useStyles();
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [displayReview, setDisplayReview] = React.useState(false);
  const alerts = useSnackbarAlerts();

  const displayCameraDeniedAlert = () => {
    alerts.error(
      "L'autorisation d'utiliser la caméra a été refusée. Pour l'activer, allez dans les paramètres de votre navigateur.",
      {},
      6000
    );
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stopCamera(stream);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      let mediaStream;

      // Try back camera first on mobile
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } }
        });
      } catch (error) {
        console.warn("Back camera not available, trying default camera...");
        // Try default camera as a fallback
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      displayCameraDeniedAlert();
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = _stream => {
    if (_stream) {
      _stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
  }, [displayReview]);

  const addWatermark = context => {
    context.font = "20px Arial";
    context.fillStyle = "rgba(255, 255, 255, 0.3)";

    const watermarkText1 = "Ne pas diffuser.";
    const watermarkText2 = "Ne pas verser au PV.";
    const textSpacing = 85;

    const angle = 30 * (Math.PI / 180);

    context.save();

    context.translate(
      canvasRef.current.width / 2,
      canvasRef.current.height / 2
    );
    context.rotate(angle);

    let i = 0;
    for (
      let y = -canvasRef.current.height;
      y < canvasRef.current.height;
      y += textSpacing
    ) {
      const watermarkText = i % 2 === 0 ? watermarkText1 : watermarkText2;
      for (
        let x = -canvasRef.current.width;
        x < canvasRef.current.width;
        x += context.measureText(watermarkText).width + textSpacing * 2
      ) {
        context.fillText(watermarkText, x, y);
      }
      i = i + 1;
    }

    context.restore();
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      addWatermark(context);
      canvasRef.current.toBlob(blob => {
        const newFile = new File([blob], "captured-image.png", {
          type: "image/png"
        });
        const imageUrl = URL.createObjectURL(newFile);
        setCapturedImages(prevImages => [
          ...prevImages,
          { file: newFile, url: imageUrl }
        ]);
      }, "image/png");
    }
  };

  const removeImage = url => {
    setCapturedImages(prevImages =>
      prevImages.filter(image => image.url !== url)
    );
  };

  return displayReview ? (
    <ControlPicturesReview
      onBack={() => setDisplayReview(false)}
      onClose={onClose}
      pictures={capturedImages}
      removeImage={removeImage}
    />
  ) : (
    <Stack direction="column">
      {stream && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <video
            ref={videoRef}
            autoPlay
            style={{
              borderRadius: "8px"
            }}
          />
          <TakePictureButton onClick={captureImage} />
          {capturedImages.length > 0 && (
            <div className={classes.pictureContainer}>
              <Picture
                src={capturedImages[0].url}
                alt=""
                height="64px"
                width="64px"
                classes={{
                  img: classes.image
                }}
                icon={
                  <span className={classes.nbPictures}>
                    {capturedImages.length}
                  </span>
                }
              />
            </div>
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ display: "none" }}
      />
      <ButtonsGroup
        buttons={[
          {
            onClick: () => setDisplayReview(true),
            children: "Enregistrer",
            iconPosition: "right",
            iconId: "fr-icon-arrow-right-s-line",
            disabled: capturedImages.length === 0
          }
        ]}
      />
    </Stack>
  );
}
