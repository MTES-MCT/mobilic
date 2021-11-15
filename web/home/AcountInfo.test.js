import React from "react";
import { shallow } from "enzyme";
import Home from "./AccountInfo";
import * as store from "common/store/store";
import * as api from "common/utils/api";
import Alert from "@material-ui/lab/Alert";
import { RESEND_ACTIVATION_EMAIL } from "common/utils/apiQueries";

let storeSpy;
let graphQlSpy;

describe("Home", () => {
  beforeAll(() => {
    storeSpy = jest.spyOn(store, "useStoreSyncedWithLocalStorage");
    const apiSpy = jest.spyOn(api, "useApi");
    apiSpy.mockReturnValue({
      graphQlMutate: jest.fn()
    });
    graphQlSpy = jest.spyOn(api.useApi(), "graphQlMutate");
  });

  const setup = propsOverwrite => {
    const mockUserInfo = () => {
      return { id: "1234" };
    };

    storeSpy.mockReturnValue({
      state: { employments: [] },
      userInfo: mockUserInfo,
      ...propsOverwrite
    });
    return shallow(<Home />);
  };

  it("should render the Home component without Alert message if email is activated", () => {
    const emailActivatedUserInfo = () => {
      return { id: "1234", hasActivatedEmail: true };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);
    const alertComponent = wrapper.find('[data-qa="emailInfoItem"]').dive();
    expect(alertComponent.exists(Alert)).toBeFalsy();
  });

  it("should render the Home component with Alert message if email is not activated", () => {
    const emailActivatedUserInfo = () => {
      return { id: "1234", hasActivatedEmail: false };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);
    const alertComponent = wrapper.find('[data-qa="emailInfoItem"]').dive();
    expect(alertComponent.exists(Alert)).toBeTruthy();
  });

  it("should call the resend email action if the resend button is clicked", () => {
    const emailActivatedUserInfo = () => {
      return { id: "1234", hasActivatedEmail: false, email: "test@test.fr" };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);

    const resendEmailButton = wrapper
      .find('[data-qa="emailInfoItem"]')
      .dive()
      .find('[data-qa="resendActivationEmailButton"]');

    resendEmailButton.props().onClick();
    expect(graphQlSpy).toHaveBeenCalledWith(
      RESEND_ACTIVATION_EMAIL,
      { email: "test@test.fr" },
      { context: { nonPublicApi: true } }
    );
  });
});
