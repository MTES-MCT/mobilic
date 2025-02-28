import React, { useEffect, useRef, useState } from "react";
import { Button, Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { ControlPicturesReview } from "./ControlPicturesReview";
import Picture from "./Picture";

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
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
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
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

  return displayReview ? (
    <ControlPicturesReview
      onBack={() => setDisplayReview(false)}
      onClose={onClose}
      pictures={capturedImages}
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
          <Button onClick={captureImage} className={classes.pictureButton} />
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
