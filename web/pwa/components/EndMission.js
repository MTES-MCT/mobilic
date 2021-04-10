import React from "react";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { FunnelModal } from "./FunnelModal";
import Container from "@material-ui/core/Container";
import { MainCtaButton } from "./MainCtaButton";
import TextField from "@material-ui/core/TextField/TextField";
import { Expenditures } from "./Expenditures";
import { AddressField } from "../../common/AddressField";

export default function EndMissionModal({
  open,
  handleClose,
  handleMissionEnd,
  currentExpenditures,
  companyAddresses = [],
  currentEndLocation = null
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

    if (open && navigator.geolocation) {
      setLoading(false);
      if (!currentEndLocation && navigator.geolocation)
        navigator.geolocation.getCurrentPosition(position => {
          setCurrentPosition(position);
        });
    }
  }, [currentExpenditures, currentEndLocation, open]);

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <form
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            await handleMissionEnd(expenditures, comment, address);
            handleClose();
          }}
        >
          <Container
            className="flex-column"
            style={{ flexShrink: 0 }}
            disableGutters
          >
            <Typography variant="h5" className="form-field-title">
              Quel est le lieu de fin de service&nbsp;?
            </Typography>
            <AddressField
              required
              fullWidth
              label="Lieu de fin de service"
              variant="filled"
              value={currentEndLocation ? currentEndLocation : address}
              disabled={!!currentEndLocation}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses}
            />
            <Typography variant="h5" className="form-field-title">
              Avez-vous eu des frais lors de cette mission&nbsp;?
            </Typography>
            <Expenditures
              expenditures={expenditures}
              setExpenditures={setExpenditures}
            />
            <Typography variant="h5" className="form-field-title">
              Avez-vous un commentaire&nbsp;? (optionnel)
            </Typography>
            <TextField
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
          <Box className="cta-container" my={4}>
            <MainCtaButton
              type="submit"
              disabled={!currentEndLocation && !address}
              loading={loading}
            >
              Suivant
            </MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
