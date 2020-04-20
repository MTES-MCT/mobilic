import React from 'react';
import {View} from 'react-native';
import {theme} from './theme';

export function Box(props) {
  let styles = {};
  if ('p' in props) {
    styles.padding = theme.spacing(props.p);
  }
  if ('px' in props) {
    styles.paddingLeft = theme.spacing(props.px);
    styles.paddingRight = theme.spacing(props.px);
  }
  if ('py' in props) {
    styles.paddingTop = theme.spacing(props.py);
    styles.paddingBottom = theme.spacing(props.py);
  }
  if ('pl' in props) {
    styles.paddingLeft = theme.spacing(props.pl);
  }
  if ('pr' in props) {
    styles.paddingRight = theme.spacing(props.pr);
  }
  if ('pt' in props) {
    styles.paddingTop = theme.spacing(props.pt);
  }
  if ('pb' in props) {
    styles.paddingBottom = theme.spacing(props.pb);
  }

  if ('m' in props) {
    styles.margin = theme.spacing(props.m);
  }
  if ('mx' in props) {
    styles.marginLeft = theme.spacing(props.mx);
    styles.marginRight = theme.spacing(props.mx);
  }
  if ('my' in props) {
    styles.marginTop = theme.spacing(props.my);
    styles.marginBottom = theme.spacing(props.my);
  }
  if ('ml' in props) {
    styles.marginLeft = theme.spacing(props.ml);
  }
  if ('mr' in props) {
    styles.marginRight = theme.spacing(props.mr);
  }
  if ('mt' in props) {
    styles.marginTop = theme.spacing(props.mt);
  }
  if ('mb' in props) {
    styles.marginBottom = theme.spacing(props.mb);
  }

  if (props.style) {
    styles = {...styles, ...props.style};
  }
  return <View style={styles}>{props.children}</View>;
}
