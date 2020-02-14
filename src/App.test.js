import React from "react";
import { render } from "@testing-library/react";
import Root from "./root";

test("renders learn react link", () => {
  const { getByText } = render(<Root />);
});
