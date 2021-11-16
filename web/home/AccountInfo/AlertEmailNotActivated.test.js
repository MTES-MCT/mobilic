import React from "react";
import { shallow } from "enzyme";
import * as api from "common/utils/api";
import { RESEND_ACTIVATION_EMAIL } from "common/utils/apiQueries";
import AlertEmailNotActivated from "./AlertEmailNotActivated";

let graphQlSpy;

describe("AlertEmailNotActivated", () => {
  beforeAll(() => {
    const apiSpy = jest.spyOn(api, "useApi");
    apiSpy.mockReturnValue({
      graphQlMutate: jest.fn()
    });
    graphQlSpy = jest.spyOn(api.useApi(), "graphQlMutate");
  });

  const setup = propsOverwrite => {
    return shallow(<AlertEmailNotActivated {...propsOverwrite} />);
  };

  it("should render the AlertEmailNotActivated correctly ", () => {
    const customProps = { email: "test1@test.fr" };
    const wrapper = setup(customProps);
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it("should call the resend email action if the resend button is clicked", () => {
    const customProps = { email: "test2@test.fr" };
    const wrapper = setup(customProps);

    const resendEmailButton = wrapper.find(
      '[data-qa="resendActivationEmailButton"]'
    );

    resendEmailButton.props().onClick();

    expect(graphQlSpy).toHaveBeenCalledWith(
      RESEND_ACTIVATION_EMAIL,
      { email: "test2@test.fr" },
      { context: { nonPublicApi: true } }
    );
  });
});
