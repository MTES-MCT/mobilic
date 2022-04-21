import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as api from "common/utils/api";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";
import { WarningModificationMission } from "./WarningModificationMission";
import * as store from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../utils/dismissableWarnings";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

jest.mock("apollo-link-timeout", () => () => {});

describe("WarningModificationMission", () => {
  let graphQlSpy;
  let storeSpy;

  beforeAll(() => {
    const apiSpy = jest.spyOn(api, "useApi");
    apiSpy.mockReturnValue({
      graphQlMutate: jest.fn()
    });
    graphQlSpy = jest.spyOn(api.useApi(), "graphQlMutate");
    storeSpy = jest.spyOn(store, "useStoreSyncedWithLocalStorage");
  });

  const setup = propsOverwrite => {
    const mockUserInfo = () => {
      return { disabledWarnings: [] };
    };
    storeSpy.mockReturnValue({
      userInfo: mockUserInfo,
      ...propsOverwrite
    });

    const theme = createTheme();

    return render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <WarningModificationMission />
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  it("should render without crashing", () => {
    setup();
    expect(screen).toBeDefined();
  });

  it("should not render Warning Alert if it has already been dismissed", () => {
    const mockUserInfo = () => {
      return {
        disabledWarnings: [DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION]
      };
    };
    const wrapper = setup({ userInfo: mockUserInfo });
    expect(wrapper.getByTestId("warningAlert")).not.toBeVisible();
  });

  it("should render Warning Alert if it has never been dismissed", () => {
    const wrapper = setup();
    expect(wrapper.getByTestId("warningAlert")).toBeVisible();
  });

  it("should call the dismiss warning api if the link is clicked", () => {
    const wrapper = setup();

    const dismissWarningMessage = wrapper.getByTestId(
      "dismissMissionModificationWarningLink"
    );
    fireEvent.click(dismissWarningMessage);

    expect(graphQlSpy).toHaveBeenCalledWith(
      DISABLE_WARNING_MUTATION,
      { warningName: DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION },
      { context: { nonPublicApi: true } }
    );
  });
});
