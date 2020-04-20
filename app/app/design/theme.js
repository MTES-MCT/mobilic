import {createTheme} from 'common/utils/theme';

const baseSpacing = 8;
const baseFontSize = 16;

export const theme = createTheme({spacing: baseSpacing});

function convertBrowserUnits(theme) {
  [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'button',
    'caption',
    'overline',
  ].forEach(typographyVariant => {
    const textProps = theme.typography[typographyVariant];
    const fontFamily = textProps.fontFamily.split(',')[0].replace(/"/g, '');
    const fontSizeInRem = parseFloat(textProps.fontSize.match(/^(\d|\.)+/)[0]);
    const fontSize = Math.round(fontSizeInRem * baseFontSize);
    const lineHeight = Math.round(textProps.lineHeight * fontSize);

    textProps.fontFamily = fontFamily;
    textProps.fontSize = fontSize;
    textProps.lineHeight = lineHeight;
    textProps.fontWeight = textProps.fontWeight.toString();
  });

  theme.typography.fontSize = theme.typography.body2.fontSize;
  theme.typography.fontWeightLight = theme.typography.fontWeightLight.toString();
  theme.typography.fontWeightMedium = theme.typography.fontWeightMedium.toString();
  theme.typography.fontWeightRegular = theme.typography.fontWeightRegular.toString();
  theme.typography.fontWeightBold = theme.typography.fontWeightBold.toString();
}

convertBrowserUnits(theme);

export const reactNativePaperTheme = {
  dark: true,
  mode: 'adaptive',
  roundness: 4,
  colors: {
    primary: theme.palette.primary.main,
    accents: theme.palette.secondary.main,
    background: theme.palette.background.default,
    surface: theme.palette.background.paper,
    text: theme.palette.text.primary,
    disabled: theme.palette.text.disabled,
    placeholder: theme.palette.text.hint,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    regular: {
      fontFamily: 'Source Sans Pro',
      fontWeight: theme.typography.fontWeightRegular,
      fontSize: baseFontSize,
    },
    medium: {
      fontFamily: 'Source Sans Pro',
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: baseFontSize,
    },
    thin: {
      fontFamily: 'Source Sans Pro',
      fontWeight: theme.typography.fontWeightLight,
      fontSize: baseFontSize,
    },
    light: {
      fontFamily: 'Source Sans Pro',
      fontWeight: theme.typography.fontWeightLight,
      fontSize: baseFontSize,
    },
  },
  animation: {
    scale: 1.0,
  },
};
