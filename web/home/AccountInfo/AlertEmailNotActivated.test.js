import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as api from "common/utils/api";
import * as snackbar from "../../common/Snackbar";
import AlertEmailNotActivated from "./AlertEmailNotActivated";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import { RESEND_ACTIVATION_EMAIL } from "common/utils/apiQueries";

jest.mock("apollo-link-timeout", () => () => {});

describe("AlertEmailNotActivated", () => {
  let graphQlSpy;

  beforeAll(() => {
    const apiSpy = jest.spyOn(api, "useApi");
    apiSpy.mockReturnValue({
      graphQlMutate: jest.fn()
    });
    graphQlSpy = jest.spyOn(api.useApi(), "graphQlMutate");

    const snackbarAlertsSpy = jest.spyOn(snackbar, "useSnackbarAlerts");
    snackbarAlertsSpy.mockReturnValue({
      success: jest.fn(),
      error: jest.fn()
    });
  });

  const setup = propsOverwrite => {
    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        <AlertEmailNotActivated {...propsOverwrite} />
      </ThemeProvider>
    );
  };

  it("should render without crashing", () => {
    setup({ email: "test1@test.fr" });
    expect(screen).toBeDefined();
  });

  it("should call the resend email action if the resend button is clicked", () => {
    const email = "test2@test.fr";
    const wrapper = setup({ email });

    const resendEmailButton = wrapper.getByTestId(
      "resendActivationEmailButton"
    );
    fireEvent.click(resendEmailButton);

    expect(graphQlSpy).toHaveBeenCalledWith(
      RESEND_ACTIVATION_EMAIL,
      { email },
      { context: { nonPublicApi: true } }
    );
  });
});
