import React from "react";
import { mount } from "enzyme";
import Home from "./AccountInfo";
import * as store from "common/store/store";
import AlertEmailNotActivated from "./AlertEmailNotActivated";

let storeSpy;

describe("Home", () => {
  beforeAll(() => {
    storeSpy = jest.spyOn(store, "useStoreSyncedWithLocalStorage");
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
    return mount(<Home />);
  };

  it("should render the Home correctly when email is not activated", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false,
        email: "testemail@yopmail.com"
      };
    };
    const customProps = { userInfo: emailActivatedUserInfo };
    const wrapper = setup(customProps);
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it("should render the Home component without AlertEmailNotActivated component if email is activated", () => {
    const emailActivatedUserInfo = () => {
      return { id: "1234", hasActivatedEmail: true };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);
    const alertComponent = wrapper.find('[data-qa="emailInfoItem"]');
    expect(alertComponent.exists(AlertEmailNotActivated)).toBeFalsy();
  });

  it("should render the Home component with AlertEmailNotActivated message if email is not activated", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false,
        email: "testemail@yopmail.com"
      };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);
    const alertComponent = wrapper.find('[data-qa="emailInfoItem"]');
    expect(alertComponent.exists(AlertEmailNotActivated)).toBeTruthy();
  });

  it("should render the Home component with AlertEmailNotActivated message if email is not activated", () => {
    const emailActivatedUserInfo = () => {
      return {
        id: "1234",
        hasActivatedEmail: false
      };
    };
    const customProps = { userInfo: emailActivatedUserInfo };

    const wrapper = setup(customProps);
    const alertComponent = wrapper.find('[data-qa="emailInfoItem"]');
    expect(alertComponent.exists(AlertEmailNotActivated)).toBeFalsy();
  });
});
