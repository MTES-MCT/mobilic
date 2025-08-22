import { Section } from "../../common/Section";
import React from "react";

/*
  Step logic for company signup, or for any process that can be decomposed in steps.

  Each step has its own `complete` prop that represents the completion status of the step.
  The sequence of steps (`Steps` component) is responsible for displaying the relevant steps, based on their completion : it hides steps that are after the currently non completed step.

  Upon completion of a step a re-render of the `Steps` component is triggered (via `reportNewCompletionStatus`) so that it can update the displayed steps
 */
export function Step({
  name,
  title,
  complete,
  reportNewCompletionStatus,
  hidden,
  reset,
  children
}) {
  const ref = React.useRef();

  React.useEffect(() => {
    if (hidden && reset) reset();

    if (!hidden && ref.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
  }, [hidden]);

  React.useEffect(() => {
    reportNewCompletionStatus(complete);
  }, [complete]);

  return !hidden ? (
    <Section ref={ref} key={name} title={title}>
      {children}
    </Section>
  ) : null;
}

export function Steps({ children }) {
  const [stepCompletionMap, setStepCompletionMap] = React.useState({});
  const steps = React.Children.toArray(children).filter(Boolean);

  let currentStepIndex = steps.findIndex(
    element => !stepCompletionMap[element.props.name]
  );
  if (currentStepIndex === -1) currentStepIndex = steps.length - 1;

  return steps.map((element, index) =>
    React.cloneElement(element, {
      key: element.name,
      title: element.props.title,
      hidden: index > currentStepIndex,
      reportNewCompletionStatus: status =>
        setStepCompletionMap(map => ({ ...map, [element.props.name]: status }))
    })
  );
}
