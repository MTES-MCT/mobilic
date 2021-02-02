import React from "react";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { MainCtaButton } from "./MainCtaButton";
import TextField from "@material-ui/core/TextField/TextField";
import { Expenditures } from "./Expenditures";
import { AddressField } from "../../common/AddressField";

const useStyles = makeStyles(theme => ({
  commentInput: {
    marginTop: theme.spacing(2)
  }
}));

export function EndMissionModal({
  open,
  handleClose,
  handleMissionEnd,
  currentExpenditures,
  companyAddresses = []
}) {
  const [expenditures, setExpenditures] = React.useState({});
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState(null);

  React.useEffect(() => {
    setExpenditures(currentExpenditures || {});
    setComment("");
    setAddress(null);
    setCurrentPosition(null);

    if (open) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition(position);
      });
    }
  }, [currentExpenditures, open]);

  const funnelModalClasses = useFunnelModalStyles();
  const classes = useStyles();

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            await Promise.all([
              new Promise(resolve => setTimeout(resolve, 500)),
              handleMissionEnd(expenditures, comment, address)
            ]);
            handleClose();
            setLoading(false);
          }}
        >
          <Container className="flex-column" disableGutters>
            <Typography className={funnelModalClasses.title} variant="h5">
              Avez-vous eu des frais lors de cette mission&nbsp;?
            </Typography>
            <Expenditures
              expenditures={expenditures}
              setExpenditures={setExpenditures}
            />
            <Typography variant="h5">
              Quel est le lieu de fin de service&nbsp;? (optionnel)
            </Typography>
            <AddressField
              fullWidth
              label="Lieu de fin de service"
              variant="filled"
              value={address}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses}
            />
            <Box my={1} />
            <Typography className={funnelModalClasses.title} variant="h5">
              Avez-vous un commentaire&nbsp;? (optionnel)
            </Typography>
            <TextField
              className={classes.commentInput}
              fullWidth
              label="Commentaire"
              variant="filled"
              multiline
              rows={4}
              rowsMax="10"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </Container>
          <Box className="cta-container" mt={2} mb={4}>
            <MainCtaButton type="submit" loading={loading}>
              Suivant
            </MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
