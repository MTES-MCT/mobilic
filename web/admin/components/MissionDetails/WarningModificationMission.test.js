import React from "react";
import { shallow } from "enzyme";
import * as api from "common/utils/api";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";
import { WarningModificationMission } from "./WarningModificationMission";
import * as store from "common/store/store";
import { DISMISSABLE_WARNINGS } from "../../utils/dismissableWarnings";

let graphQlSpy;
let storeSpy;

describe("WarningModificationMission", () => {
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
    return shallow(<WarningModificationMission />);
  };

  it("should render the WarningModificationMission correctly ", () => {
    const wrapper = setup();
    expect(wrapper.debug()).toMatchSnapshot();
  });

  it("should not render the Warning Alert if it has already been dismissed", () => {
    const mockUserInfo = () => {
      return {
        disabledWarnings: [DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION]
      };
    };
    const customUserInfo = {
      userInfo: mockUserInfo
    };
    const wrapper = setup(customUserInfo);
    expect(
      wrapper.find('[data-qa="modificationWarningCollapse"]').prop("in")
    ).toBeFalsy();
  });

  it("should render the Warning Alert if it has never been dismissed", () => {
    const wrapper = setup();
    expect(
      wrapper.find('[data-qa="modificationWarningCollapse"]').prop("in")
    ).toBeTruthy();
  });

  it("should call the dismiss warning api if the link is cliclked", () => {
    const wrapper = setup();

    const dismissWarningMessage = wrapper.find(
      '[data-qa="dismissMissionModificationWarningLink"]'
    );

    dismissWarningMessage.props().onClick({ preventDefault: () => {} });

    expect(graphQlSpy).toHaveBeenCalledWith(
      DISABLE_WARNING_MUTATION,
      { warningName: DISMISSABLE_WARNINGS.ADMIN_MISSION_MODIFICATION },
      { context: { nonPublicApi: true } }
    );
  });
});
