import React from "react";
import { useDropzone } from "react-dropzone";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import DescriptionIcon from "@mui/icons-material/Description";
import CircularProgress from "@mui/material/CircularProgress";
import { useApi } from "common/utils/api";

import { useSnackbarAlerts } from "../common/Snackbar";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { usePageTitle } from "../common/UsePageTitle";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const STATUS_MAP = {
  SUCCESS: {
    title: "fichier intègre",
    desc: "Le fichier n'a pas été modifié après sa génération par Mobilic"
  },
  INTERNAL_ERROR: {
    title: "erreur interne",
    desc:
      "La vérification d'intégrité n'a pas pu être effectuée à cause d'une erreur interne. Veuillez réessayer plus tard."
  },
  NETWORK_ERROR: {
    title: "erreur de connexion",
    desc: "Le serveur Mobilic semble injoignable. Veuillez réessayer plus tard."
  },
  MISSING_FILE: {
    title: "pas de fichier",
    desc: "Aucun fichier n'a été détecté"
  },
  MISSING_SIGNATURE: {
    title: "vérification impossible",
    desc: "Le fichier ne provient pas de Mobilic."
  },
  INVALID_FORMAT: {
    title: "mauvais format",
    desc: "Le fichier n'est pas dans un format .xlsx valide"
  },
  SIGNATURE_DOES_NOT_MATCH: {
    title: "fichier non intègre",
    desc: "Le fichier a été modifié après sa génération par Mobilic."
  },
  UNAVAILABLE: {
    title: "service non disponible",
    desc:
      "Impossible d'effectuer la vérification d'intégrité, veuillez réessayer plus tard."
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(2)
  },
  text: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  outer: {
    height: 150,
    width: "100%",
    margin: "auto",
    position: "relative"
  },
  container: {
    width: "100%",
    height: "100%",
    cursor: "pointer",
    flex: 1,
    display: "flex",
    flexDirection: "row",
    flewWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderRadius: 10,
    borderColor: ({ isDragActive, fileName, verifyResponse }) =>
      verifyResponse
        ? verifyResponse.success
          ? theme.palette.success.main
          : theme.palette.error.main
        : isDragActive || fileName
        ? theme.palette.primary.main
        : theme.palette.grey[500],
    borderStyle: "dashed",
    backgroundColor: ({ verifyResponse }) =>
      verifyResponse
        ? verifyResponse.success
          ? theme.palette.success.light
          : theme.palette.error.light
        : theme.palette.grey[100],
    color: ({ verifyResponse }) =>
      verifyResponse
        ? verifyResponse.success
          ? theme.palette.success.main
          : theme.palette.error.main
        : theme.palette.grey[700],
    outline: "none",
    transition: "backgroundColor .24s ease-in-out",
    filter: ({ loading }) => (loading ? "blur(1px)" : "none")
  },
  inner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  newFileButton: {
    margin: theme.spacing(2)
  },
  response: {
    textAlign: "justify",
    marginTop: theme.spacing(2)
  },
  titleUppercase: {
    textTransform: "uppercase"
  }
}));

export function XlsxVerifier() {
  usePageTitle("Vérification Intégrité - Mobilic");
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState(null);
  const [verifyResponse, setVerifyResponse] = React.useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    validator: file => {
      if (!file.name.endsWith(".xlsx"))
        return {
          code: "bad-extension",
          message: "Le fichier n'est pas un .xlsx"
        };
    },
    accept: ".xlsx",
    onDropAccepted: async files => {
      const file = files[0];
      setFileName(file.name);
      setLoading(true);
      const fd = new FormData();
      fd.append("xlsx-to-check", file);
      try {
        const json = await api.jsonHttpQuery(
          HTTP_QUERIES.verifyXlsxSignature,
          {
            body: fd,
            timeout: 15000
          },
          true
        );
        setVerifyResponse(json);
      } catch (err) {
        captureSentryException(err);
        if (err.name === "NetworkError" || err.name === "AbortError") {
          setVerifyResponse({ error: "NETWORK_ERROR" });
        } else setVerifyResponse({ error: "INTERNAL_ERROR" });
      }
      setLoading(false);
    },
    onDropRejected: fileRejections => {
      alerts.error(
        "Fichier invalide. Seuls les fichiers avec extension .xlsx sont acceptés",
        "rejection",
        6000
      );
    }
  });

  const classes = useStyles({
    isDragActive,
    fileName,
    loading,
    verifyResponse
  });

  const verifyResponseStatus = verifyResponse
    ? verifyResponse.success
      ? "SUCCESS"
      : verifyResponse.error_code
    : null;

  return (
    <>
      <Header disableMenu />
      <PaperContainer>
        <Container className={`centered ${classes.root}`} maxWidth="sm">
          <PaperContainerTitle>
            Vérification de l'intégrité d'un fichier
          </PaperContainerTitle>
          <Typography align="justify" className={classes.text}>
            Vous pouvez vérifier ici l'intégrité des rapports d'activité au
            format Excel (.xlsx) <strong>téléchargés depuis Mobilic</strong> et
            envoyés par les entreprises. Un fichier est considéré comme intègre
            s’il n'a subi{" "}
            <strong>aucune modification après son téléchargement</strong>. Cela
            vous assure que les données du rapport d'activité n'ont pas été
            modifiées avant de vous le transmettre.
          </Typography>
          <Box className={classes.outer}>
            <Box
              {...getRootProps({ className: classes.container })}
              style={{ filter: loading ? "blur" : "abc" }}
            >
              <input {...getInputProps()} />
              {fileName && <DescriptionIcon color="inherit" />}
              <Typography sx={{ padding: 2 }} color="inherit">
                {fileName
                  ? fileName
                  : "Déposez votre fichier ici ou cliquez pour choisir un fichier. Seuls les .xlsx sont acceptés."}
              </Typography>
            </Box>
            {loading && (
              <Box className={classes.inner}>
                <CircularProgress
                  style={{ position: "absolute" }}
                  color="primary"
                />
              </Box>
            )}
          </Box>
          {verifyResponse && (
            <Alert
              variant="filled"
              className={classes.response}
              severity={verifyResponse.success ? "success" : "error"}
            >
              <AlertTitle className={`bold ${classes.titleUppercase}`}>
                {
                  (
                    STATUS_MAP[verifyResponseStatus] ||
                    STATUS_MAP.INTERNAL_ERROR
                  ).title
                }{" "}
              </AlertTitle>
              {
                (STATUS_MAP[verifyResponseStatus] || STATUS_MAP.INTERNAL_ERROR)
                  .desc
              }
            </Alert>
          )}
        </Container>
      </PaperContainer>
    </>
  );
}
