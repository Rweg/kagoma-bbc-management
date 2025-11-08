import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a237e', // Deep Blue (Basketball court vibes)
    secondary: '#ff6f00', // Orange (Basketball color)
    accent: '#4caf50', // Green for positive amounts
    error: '#f44336', // Red for expenses/negative
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#212121',
    onSurface: '#000000',
    disabled: '#9e9e9e',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#ff6f00',
  },
  roundness: 8,
};

export const colors = {
  primary: '#1a237e',
  secondary: '#ff6f00',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  light: '#f5f5f5',
  dark: '#212121',
  white: '#ffffff',
  gray: '#757575',
};

