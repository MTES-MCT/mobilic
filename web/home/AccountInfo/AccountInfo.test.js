import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./AccountInfo";
import * as store from "common/store/store";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material";
import * as api from "common/utils/api";
import { waitFor } from "@babel/core/lib/gensync-utils/async";

jest.mock("apollo-link-timeout", () => () => {});
jest.mock("../../common/Header", () => ({
  Header: () => <div>Mock</div>
}));
jest.mock("../../common/EmploymentInfoCard", () => ({
  EmploymentInfoCard: () => <div>Mock</div>
}));
jest.mock("./AlertEmailNotActivated", () => props => (
  <div {...props}>Mock</div>
));

describe("<Home />", () => {
  let storeSpy;

  beforeAll(() => {
    const apiSpy = jest.spyOn(api, "useApi");
    apiSpy.mockReturnValue({
      graphQlMutate: jest.fn()
    });
    storeSpy = jest.spyOn(store, "useStoreSyncedWithLocalStorage");
  });

  const setup = propsOverwrite => {
    const mockUserInfo = () => {
      return { id: "1234" };
    };

    storeSpy.mockReturnValue({
      state: { employments: [] },
      userInfo: mockUserInfo,
      companies: () => [],
      ...propsOverwrite
    });

    const theme = createTheme();
    return render(
      <ThemeProvider theme={theme}>
        <Home />
      </ThemeProvider>
    );
  };

  it("should render without crashing", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false,
        email: "testemail@yopmail.com"
      };
    };

    setup({ userInfo: emailActivatedUserInfo });
    expect(screen).toBeDefined();
  });

  it("should render without AlertEmailNotActivated if email is activated", async () => {
    await waitFor(() => {
      const emailActivatedUserInfo = () => {
        return { id: "1234", hasActivatedEmail: true };
      };

      const wrapper = setup({ userInfo: emailActivatedUserInfo });
      expect(wrapper.queryByTestId("alertEmailNotActivated")).toBeFalsy();
    });
  });

  it("should render with AlertEmailNotActivated if email is not activated", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false,
        email: "testemail@yopmail.com"
      };
    };

    const wrapper = setup({ userInfo: emailActivatedUserInfo });
    expect(wrapper.queryByTestId("alertEmailNotActivated")).toBeTruthy();
  });

  it("should render without AlertEmailNotActivated if email is undefined", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false
      };
    };

    const wrapper = setup({ userInfo: emailActivatedUserInfo });
    expect(wrapper.queryByTestId("alertEmailNotActivated")).toBeFalsy();
  });
});
