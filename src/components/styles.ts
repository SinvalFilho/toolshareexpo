export type Colors = {
  background: '#e98b2c';
  surface: '#1E1E1E';
  primary: '#ac3b13';
  secondary: '#03DAC6';
  error: '#CF6679';
  text: '#FFFFFF';
  textSecondary: '#B0B0B0';
  income: '#4CAF50';
  expense: '#EF5350';
  divider: '#383838';
};

export const colors = {
  background: '#e98b2c',
  surface: '#1E1E1E',
  primary: '#ac3b13',
  secondary: '#03DAC6',
  error: '#CF6679',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  income: '#4CAF50',
  expense: '#EF5350',
  divider: '#383838',
} as const satisfies Colors;