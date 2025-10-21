import React, { useEffect, useRef, useState } from "react";
import { Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ControlPicturesReview } from "./ControlPicturesReview";
import { TakePictureButton } from "./TakePictureButton";
import Picture from "./Picture";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import Notice from "../../../common/Notice";
import { useControl } from "../../utils/contextControl";

const MAX_NB_PICTURES = 60;

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
  const { controlData } = useControl();
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [displayReview, setDisplayReview] = React.useState(false);
  const alerts = useSnackbarAlerts();

  const remaining_pictures = React.useMemo(
    () =>
      MAX_NB_PICTURES -
      (controlData.pictures?.length || 0) -
      capturedImages.length,
    [capturedImages, controlData.pictures]
  );

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
      videoRef.current.setAttribute("webkit-playsinline", "");
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
          video: { facingMode: { exact: "environment" }, aspectRatio: 1 }
        });
      } catch (error) {
        console.warn("Back camera not available, trying default camera...");
        // Try default camera as a fallback
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          aspectRatio: 1
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

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;

      const squareSize = Math.min(videoWidth, videoHeight);

      const startX = (videoWidth - squareSize) / 2;
      const startY = (videoHeight - squareSize) / 2;

      canvasRef.current.width = squareSize;
      canvasRef.current.height = squareSize;

      context.drawImage(
        videoRef.current,
        startX,
        startY,
        squareSize,
        squareSize,
        0,
        0,
        squareSize,
        squareSize
      );

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
    <Stack direction="column" rowGap={2}>
      <Notice
        description={
          remaining_pictures > 0
            ? `Vous pouvez prendre ${remaining_pictures} photos supplémentaires.`
            : `Vous avez atteint la limite de ${MAX_NB_PICTURES} photos par contrôle.`
        }
        type={remaining_pictures > 0 ? "info" : "error"}
      />
      {stream && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              borderRadius: "8px",
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover"
            }}
          />
          <TakePictureButton
            onClick={captureImage}
            disabled={remaining_pictures <= 0}
          />
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
        width="480"
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
