import React from 'react';
import {Text} from 'react-native';
import {theme} from './theme';

export default function Typography(props) {
  const variant = props.variant || 'body2';
  let styles = theme.typography[variant];
  const extraProps = {};

  if (props.bold) {
    styles.fontWeight = theme.typography.fontWeightBold;
  }
  if (props.noWrap) {
    extraProps.numberOfLines = 1;
  }

  if (props.style) {
    styles = {...styles, ...props.style};
  }

  return (
    <Text style={styles} {...extraProps}>
      {props.children}
    </Text>
  );
}
