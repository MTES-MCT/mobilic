import React from "react";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { formatPersonName } from "common/utils/coworkers";
import { Header } from "../../common/Header";
import { Section } from "../../common/Section";
import Grid from "@mui/material/Grid";
import { InfoItem } from "../InfoField";
import { useApi } from "common/utils/api";
import { useModals } from "common/utils/modals";
import Divider from "@mui/material/Divider";
import {
  PaperContainer,
  PaperContainerTitle
} from "../../common/PaperContainer";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";
import {
  CHANGE_EMAIL_MUTATION,
  CHANGE_NAME_MUTATION,
  CHANGE_PHONE_NUMBER_MUTATION,
  CHANGE_TIMEZONE_MUTATION
} from "common/utils/apiQueries";
import { EmploymentInfoCard } from "../../common/EmploymentInfoCard";
import { employmentSelector } from "common/store/selectors";
import AlertEmailNotActivated from "./AlertEmailNotActivated";
import { getTimezone, getTimezonePrettyName } from "common/utils/timezones";
import { OAuthTokenSection } from "./OAuthTokensSection";
import { currentUserId } from "common/utils/cookie";
import { UserControlSection } from "./UserControlSection";
import { usePageTitle } from "../../common/UsePageTitle";
import { parsePhoneNumber } from "libphonenumber-js";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  innerContainer: {
    paddingBottom: theme.spacing(6)
  }
}));

function NoEmploymentAlert() {
  return (
    <Notice
      type="warning"
      description={
        <>
          Vous n'avez aucune entreprise à laquelle vous êtes rattaché(e) et{" "}
          <span className="bold">
            vous ne pouvez donc pas enregistrer de temps de travail
          </span>
          . Rapprochez-vous de votre employeur du moment pour effectuer le
          rattachement.
        </>
      }
    />
  );
}

export default function Home() {
  usePageTitle("Mes Informations - Mobilic");
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const employments = employmentSelector(store.state);
  const modals = useModals();

  const userInfo = store.userInfo();
  const isActive = userInfo.hasActivatedEmail;

  const displayPhoneNumber = React.useMemo(() => {
    if (!userInfo.phoneNumber) {
      return undefined;
    }
    const phoneNumber = parsePhoneNumber(userInfo.phoneNumber);
    return phoneNumber ? phoneNumber.formatNational() : undefined;
  }, [userInfo.phoneNumber]);

  return [
    <Header key={0} />,
    <PaperContainer key={1} style={{ textAlign: "left" }}>
      <Container className={`centered ${classes.innerContainer}`} maxWidth="sm">
        <PaperContainerTitle component="h1">
          Mes informations
        </PaperContainerTitle>
        <Section title="Moi" component="h2">
          <Grid container wrap="wrap" spacing={4}>
            <Grid item xs={12}>
              <InfoItem
                name="Identifiant"
                value={userInfo.id}
                info={
                  employments.length === 0
                    ? "Cet identifiant est à communiquer à votre employeur afin qu'il vous rattache à l'entreprise"
                    : ""
                }
                uppercaseTitle={false}
              />
            </Grid>
            <Grid item xs={12} zeroMinWidth>
              <InfoItem
                name="Nom"
                value={formatPersonName(userInfo)}
                action={() =>
                  modals.open("changeName", {
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    handleSubmit: async ({ firstName, lastName }) => {
                      if (
                        firstName !== userInfo.firstName ||
                        lastName !== userInfo.lastName
                      ) {
                        const apiResponse = await api.graphQlMutate(
                          CHANGE_NAME_MUTATION,
                          {
                            userId: currentUserId(),
                            newFirstName: firstName,
                            newLastName: lastName
                          },
                          { context: { nonPublicApi: true } }
                        );
                        await store.setUserInfo({
                          ...store.userInfo(),
                          ...apiResponse.data.account.changeName
                        });
                        await broadCastChannel.postMessage("update");
                      }
                    }
                  })
                }
                uppercaseTitle={false}
              />
            </Grid>
            {userInfo.birthDate && (
              <Grid item xs={12} zeroMinWidth>
                <InfoItem
                  name="Date de naissance"
                  value={frenchFormatDateStringOrTimeStamp(userInfo.birthDate)}
                  uppercaseTitle={false}
                />
              </Grid>
            )}
            <Grid item xs={12} zeroMinWidth>
              <InfoItem
                data-testid="emailInfoItem"
                name="Adresse email"
                value={userInfo.email}
                action={() =>
                  modals.open("changeEmail", {
                    handleSubmit: async email => {
                      const apiResponse = await api.graphQlMutate(
                        CHANGE_EMAIL_MUTATION,
                        { email },
                        { context: { nonPublicApi: true } }
                      );
                      await store.setUserInfo({
                        ...store.userInfo(),
                        ...apiResponse.data.account.changeEmail
                      });
                      await broadCastChannel.postMessage("update");
                    }
                  })
                }
                alertComponent={
                  isActive || !userInfo.email ? null : (
                    <AlertEmailNotActivated
                      email={userInfo.email}
                      data-testid="alertEmailNotActivated"
                    />
                  )
                }
                uppercaseTitle={false}
              />
            </Grid>
            <Grid item xs={12} zeroMinWidth>
              <InfoItem
                data-testid="timezoneInfoItem"
                name="Fuseau horaire"
                value={getTimezonePrettyName(userInfo.timezoneName)}
                action={() =>
                  modals.open("changeTimezone", {
                    defaultValue: getTimezone(userInfo.timezoneName),
                    handleSubmit: async timezone => {
                      const apiResponse = await api.graphQlMutate(
                        CHANGE_TIMEZONE_MUTATION,
                        { timezoneName: timezone.name },
                        { context: { nonPublicApi: true } }
                      );
                      await store.setUserInfo({
                        ...store.userInfo(),
                        timezoneName:
                          apiResponse.data.account.changeTimezone.timezoneName
                      });
                      await broadCastChannel.postMessage("update");
                    }
                  })
                }
                uppercaseTitle={false}
              />
            </Grid>
            <Grid item xs={12} zeroMinWidth>
              <InfoItem
                name="Numéro de téléphone"
                value={displayPhoneNumber}
                valuePlaceholder="Aucun numéro renseigné"
                action={() =>
                  modals.open("changePhoneNumber", {
                    phoneNumber: userInfo.phoneNumber,
                    handleSubmit: async ({ newPhoneNumber }) => {
                      if (newPhoneNumber !== userInfo.phoneNumber) {
                        const apiResponse = await api.graphQlMutate(
                          CHANGE_PHONE_NUMBER_MUTATION,
                          {
                            userId: currentUserId(),
                            newPhoneNumber: newPhoneNumber
                          },
                          { context: { nonPublicApi: true } }
                        );
                        await store.setUserInfo({
                          ...store.userInfo(),
                          ...apiResponse.data.account.changePhoneNumber
                        });
                        await broadCastChannel.postMessage("update");
                      }
                    }
                  })
                }
                uppercaseTitle={false}
              />
            </Grid>
          </Grid>
        </Section>
        {isActive && <Divider className="hr-unstyled" />}
        {isActive && (
          <Section
            component="h2"
            title={
              employments.length > 1 ? "Mes entreprises" : "Mon entreprise"
            }
          >
            {employments.length > 0 ? (
              <Grid container spacing={2} direction="column">
                {employments.map(e => (
                  <Grid item xs={12} key={e.id}>
                    <EmploymentInfoCard
                      employment={e}
                      key={e.id}
                      defaultOpen={
                        employments.length === 1 || !e.isAcknowledged
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <NoEmploymentAlert />
            )}
          </Section>
        )}
        {isActive && <OAuthTokenSection />}
        {isActive && <UserControlSection />}
      </Container>
    </PaperContainer>
  ];
}
